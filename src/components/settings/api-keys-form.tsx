"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Copy, Check, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { ServiceName } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import replaceSpecialCharacters from "replace-special-characters";
import { ModelSelector } from "@/components/shared/model-selector";
import {
  AI_MODELS,
  MODEL_DESIGNATIONS,
  getProvidersArray,
  type ApiKey,
} from "@/lib/ai-models";
import { fetchOllamaModels } from "@/utils/actions/ollama";

const LOCAL_STORAGE_KEY = "persona-api-keys";
const MODEL_STORAGE_KEY = "persona-default-model";
const OLLAMA_URL_KEY = "persona-ollama-url";
const OLLAMA_MODELS_KEY = "persona-ollama-models";

export function ApiKeysForm({ isProPlan }: { isProPlan: boolean }) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Record<ServiceName, boolean>>(
    {} as Record<ServiceName, boolean>
  );
  const [newKeyValues, setNewKeyValues] = useState<Record<ServiceName, string>>(
    {} as Record<ServiceName, string>
  );
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<ServiceName | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Ollama state
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  // Load stored data on mount
  useEffect(() => {
    // Load API keys
    const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedKeys) {
      try {
        setApiKeys(JSON.parse(storedKeys));
      } catch (error) {
        console.error("Error loading API keys:", error);
      }
    }

    // Load default model
    const storedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    if (storedModel) {
      setDefaultModel(storedModel);
    } else if (isProPlan) {
      // Set the best default model for Pro users
      setDefaultModel(MODEL_DESIGNATIONS.DEFAULT_PRO);
      localStorage.setItem(MODEL_STORAGE_KEY, MODEL_DESIGNATIONS.DEFAULT_PRO);
    } else {
      // Set free model for non-Pro users
      setDefaultModel(MODEL_DESIGNATIONS.DEFAULT_FREE);
      localStorage.setItem(MODEL_STORAGE_KEY, MODEL_DESIGNATIONS.DEFAULT_FREE);
    }

    // Load Ollama settings
    const storedOllamaUrl = localStorage.getItem(OLLAMA_URL_KEY);
    if (storedOllamaUrl) setOllamaUrl(storedOllamaUrl);

    const storedOllamaModels = localStorage.getItem(OLLAMA_MODELS_KEY);
    if (storedOllamaModels) {
      try {
        setOllamaModels(JSON.parse(storedOllamaModels));
      } catch {
        // ignore
      }
    }

    // Mark initial load as complete
    setHasLoaded(true);
  }, [isProPlan]);

  // Save API keys to local storage whenever they change
  useEffect(() => {
    if (hasLoaded) {
      // Only save after initial load
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apiKeys));
    }
  }, [apiKeys, hasLoaded]);

  // Save default model to local storage whenever it changes
  useEffect(() => {
    // Only save if we have a model (prevents overwriting on initial mount)
    if (defaultModel) {
      localStorage.setItem(MODEL_STORAGE_KEY, defaultModel);
    }
  }, [defaultModel]);

  const handleUpdateKey = (service: ServiceName) => {
    const keyValue = newKeyValues[service];
    if (!keyValue?.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    // Normalize the API key by replacing special characters
    const normalizedKey = replaceSpecialCharacters(keyValue.trim());

    const newKey: ApiKey = {
      service,
      key: normalizedKey,
      addedAt: new Date().toISOString(),
    };

    setApiKeys((prev) => {
      const exists = prev.findIndex((k) => k.service === service);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = newKey;
        return updated;
      }
      return [...prev, newKey];
    });

    // Automatically set the default model based on the provider
    const autoSelectModel = () => {
      switch (service) {
        case "anthropic":
          return MODEL_DESIGNATIONS.FRONTIER;
        case "openai":
          return MODEL_DESIGNATIONS.FRONTIER_ALT;
        case "openrouter":
          return MODEL_DESIGNATIONS.BALANCED;
        default:
          return defaultModel;
      }
    };

    const newModel = autoSelectModel();
    if (newModel !== defaultModel) {
      setDefaultModel(newModel);
      toast.success(
        `Default model automatically set to ${AI_MODELS.find((m) => m.id === newModel)?.name}`
      );
    }

    setNewKeyValues((prev) => ({
      ...prev,
      [service]: "",
    }));
    toast.success("API key saved successfully");
  };

  const handleRemoveKey = (service: ServiceName) => {
    setApiKeys((prev) => prev.filter((k) => k.service !== service));
    setVisibleKeys((prev) => {
      const updated = { ...prev };
      delete updated[service];
      return updated;
    });

    // Check if current default model requires this API key
    const currentModel = AI_MODELS.find((m) => m.id === defaultModel);
    if (currentModel?.provider === service) {
      // Find first available model that has API key
      const firstAvailableModel = AI_MODELS.find((m) =>
        apiKeys.some((k) => k.service === m.provider && k.service !== service)
      );

      if (firstAvailableModel) {
        setDefaultModel(firstAvailableModel.id);
        toast.info(`Switched to ${firstAvailableModel.name}`);
      } else {
        setDefaultModel("");
        toast.info("No models available. Please add an API key");
      }
    }

    toast.success("API key removed successfully");
  };

  const getExistingKey = (service: ServiceName) =>
    apiKeys.find((k) => k.service === service);

  const handleModelChange = (modelId: string) => {
    setDefaultModel(modelId);
  };

  const handleCopyKey = (service: ServiceName, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(service);
    setTimeout(() => setCopiedKey(null), 1000);
  };

  const handleDiscoverOllamaModels = async () => {
    setOllamaLoading(true);
    setOllamaError(null);
    localStorage.setItem(OLLAMA_URL_KEY, ollamaUrl);

    const { models, error } = await fetchOllamaModels(ollamaUrl);

    setOllamaLoading(false);

    if (error) {
      setOllamaError(error);
      toast.error("Could not connect to Ollama");
      return;
    }

    setOllamaModels(models);
    localStorage.setItem(OLLAMA_MODELS_KEY, JSON.stringify(models));
    window.dispatchEvent(
      new CustomEvent("persona-ollama-updated", { detail: models })
    );

    if (models.length === 0) {
      toast.info(
        "Connected but no models found. Pull a model with: ollama pull llama3.2"
      );
    } else {
      toast.success(
        `Found ${models.length} Ollama model${models.length !== 1 ? "s" : ""}`
      );
    }
  };

  const handleClearOllama = () => {
    setOllamaModels([]);
    setOllamaError(null);
    localStorage.removeItem(OLLAMA_MODELS_KEY);
    window.dispatchEvent(
      new CustomEvent("persona-ollama-updated", { detail: [] })
    );
    if (defaultModel.startsWith("ollama::")) {
      setDefaultModel(MODEL_DESIGNATIONS.DEFAULT_FREE);
      localStorage.setItem(MODEL_STORAGE_KEY, MODEL_DESIGNATIONS.DEFAULT_FREE);
    }
    toast.success("Ollama disconnected");
  };

  return (
    <div className="space-y-6">
      {/* Model Selection Card */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-white/50 to-white/30 border border-white/40 shadow-xl backdrop-blur-sm">
        <Label className="text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Default AI Model
        </Label>
        <p className="text-sm text-muted-foreground mt-2 mb-3">
          This model will be used for all AI operations throughout the
          application. All models require their respective API keys.
        </p>
        <ModelSelector
          value={defaultModel}
          onValueChange={handleModelChange}
          apiKeys={apiKeys}
          isProPlan={isProPlan}
          className="w-full mt-1"
          placeholder="Select an AI model"
          ollamaModels={ollamaModels}
        />
      </div>

      {/* API Keys Card */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-white/50 to-white/30 border border-white/40 shadow-xl backdrop-blur-sm">
        <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          API Keys
        </Label>
        <div className="mt-2 mb-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Add your API keys to use premium AI models. Your keys are stored
            securely in your browser.
          </p>
          <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/50 text-amber-900 text-sm">
            {isProPlan ? (
              <>
                <p>
                  <strong>Pro Account Active:</strong> You have full access to
                  all AI models without needing to manage API keys.
                </p>
                <p className="mt-1">
                  You can still add personal API keys below if you prefer to use
                  your own credentials.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Security Note:</strong> API keys are stored locally in
                  your browser. While convenient, this means anyone with access
                  to this device could potentially view your keys.
                </p>
                <p className="mt-1">
                  For enhanced security, consider{" "}
                  <a
                    href="/subscription"
                    className="text-amber-700 hover:text-amber-800 underline underline-offset-2"
                  >
                    upgrading to a Pro account
                  </a>{" "}
                  where we securely manage API access for you.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Stable Providers */}
          {getProvidersArray()
            .filter((p) => !p.unstable)
            .map((provider) => {
              const existingKey = getExistingKey(provider.id);
              const isVisible = visibleKeys[provider.id];
              const providerModels = AI_MODELS.filter(
                (model) => model.provider === provider.id
              );

              return (
                <div
                  key={provider.id}
                  className={cn(
                    "p-4 rounded-lg bg-white/30 border transition-all hover:bg-white/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-800">
                        {provider.name}
                      </Label>
                    </div>
                    {existingKey && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setVisibleKeys((prev) => ({
                              ...prev,
                              [provider.id]: !prev[provider.id],
                            }))
                          }
                          className="h-7 px-2 text-muted-foreground hover:text-gray-900 transition-colors"
                        >
                          {isVisible ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopyKey(provider.id, existingKey.key)
                          }
                          className={cn(
                            "h-7 px-2 transition-colors",
                            copiedKey === provider.id
                              ? "text-emerald-500 hover:text-emerald-600"
                              : "text-muted-foreground hover:text-gray-900"
                          )}
                        >
                          {copiedKey === provider.id ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveKey(provider.id)}
                          className="h-7 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>

                  {existingKey ? (
                    <div className="text-xs space-y-1">
                      <div className="text-muted-foreground">
                        Added{" "}
                        {new Date(existingKey.addedAt).toLocaleDateString()}
                      </div>
                      {isVisible && (
                        <div className="font-mono bg-white/50 px-3 py-1.5 rounded-md text-sm border border-white/40">
                          {existingKey.key}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Input
                          type={isVisible ? "text" : "password"}
                          placeholder="Enter API key"
                          value={newKeyValues[provider.id] || ""}
                          onChange={(e) =>
                            setNewKeyValues((prev) => ({
                              ...prev,
                              [provider.id]: e.target.value,
                            }))
                          }
                          className="bg-white/50 flex-1 h-9 text-sm border-black/20 focus:border-black/30 hover:border-black/25 transition-colors"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setVisibleKeys((prev) => ({
                              ...prev,
                              [provider.id]: !prev[provider.id],
                            }))
                          }
                          className="bg-white/50 h-9 w-9 hover:bg-white/60 transition-colors"
                        >
                          {isVisible ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 h-9 px-4 text-sm transition-colors"
                          onClick={() => handleUpdateKey(provider.id)}
                        >
                          Save
                        </Button>
                      </div>
                      <a
                        href={provider.apiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs text-teal-600 hover:text-teal-700 underline underline-offset-2"
                      >
                        Get your {provider.name} API key →
                      </a>
                    </>
                  )}

                  {providerModels.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Available models:{" "}
                      {providerModels
                        .map(
                          (m) =>
                            `${m.name}${m.features.isUnstable ? " (Unstable)" : ""}`
                        )
                        .join(", ")}
                    </div>
                  )}
                </div>
              );
            })}

          {/* Ollama (Local AI) Section */}
          <div className="mt-6 pt-6 border-t border-emerald-200/50">
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">🦙</span>
                <Label className="text-sm font-semibold text-gray-800">
                  Ollama (Local AI)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Run AI models locally on your machine — free, private, no API
                key required. Requires{" "}
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                >
                  Ollama
                </a>{" "}
                to be installed and running.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/30 border border-emerald-100 transition-all hover:bg-white/40">
              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Ollama URL
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="bg-white/50 flex-1 h-9 text-sm border-black/20 focus:border-black/30 hover:border-black/25 transition-colors font-mono"
                />
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 h-9 px-4 text-sm transition-colors gap-1.5"
                  onClick={handleDiscoverOllamaModels}
                  disabled={ollamaLoading}
                >
                  {ollamaLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {ollamaLoading ? "Connecting…" : "Connect"}
                </Button>
              </div>

              {ollamaError && (
                <p className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200/50 px-3 py-2 rounded-md">
                  {ollamaError}. Make sure Ollama is running and the URL is
                  correct.
                </p>
              )}

              {ollamaModels.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-emerald-700">
                      {ollamaModels.length} model
                      {ollamaModels.length !== 1 ? "s" : ""} available
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearOllama}
                      className="h-6 px-2 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                      Disconnect
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ollamaModels.map((model) => (
                      <span
                        key={model}
                        className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-mono"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select an Ollama model from the{" "}
                    <strong>Default AI Model</strong> dropdown above.
                  </p>
                </div>
              )}

              {ollamaModels.length === 0 && !ollamaError && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Pull models with{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">
                    ollama pull llama3.2
                  </code>
                  , then click Connect.
                </p>
              )}
            </div>
          </div>

          {/* Unstable Providers Section */}
          <div className="mt-8 pt-6 border-t border-amber-200/50">
            <div className="mb-4 p-3 rounded-lg bg-amber-50/50 border border-amber-200/50 text-amber-900 text-sm">
              <p className="font-medium">Experimental Providers Notice</p>
              <p className="mt-1">
                The following providers are currently unstable. You may
                experience errors or intermittent service. We recommend using
                stable providers above for critical operations.
              </p>
            </div>

            {getProvidersArray()
              .filter((p) => p.unstable)
              .map((provider) => {
                const existingKey = getExistingKey(provider.id);
                const isVisible = visibleKeys[provider.id];
                const providerModels = AI_MODELS.filter(
                  (model) => model.provider === provider.id
                );

                return (
                  <div
                    key={provider.id}
                    className={cn(
                      "p-4 rounded-lg bg-white/30 border transition-all hover:bg-white/40",
                      "relative border-amber-200/50"
                    )}
                  >
                    <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                      Unstable
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-gray-800">
                          {provider.name}
                        </Label>
                      </div>
                      {existingKey && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setVisibleKeys((prev) => ({
                                ...prev,
                                [provider.id]: !prev[provider.id],
                              }))
                            }
                            className="h-7 px-2 text-muted-foreground hover:text-gray-900 transition-colors"
                          >
                            {isVisible ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCopyKey(provider.id, existingKey.key)
                            }
                            className={cn(
                              "h-7 px-2 transition-colors",
                              copiedKey === provider.id
                                ? "text-emerald-500 hover:text-emerald-600"
                                : "text-muted-foreground hover:text-gray-900"
                            )}
                          >
                            {copiedKey === provider.id ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveKey(provider.id)}
                            className="h-7 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>

                    {existingKey ? (
                      <div className="text-xs space-y-1">
                        <div className="text-muted-foreground">
                          Added{" "}
                          {new Date(existingKey.addedAt).toLocaleDateString()}
                        </div>
                        {isVisible && (
                          <div className="font-mono bg-white/50 px-3 py-1.5 rounded-md text-sm border border-white/40">
                            {existingKey.key}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <Input
                            type={isVisible ? "text" : "password"}
                            placeholder="Enter API key"
                            value={newKeyValues[provider.id] || ""}
                            onChange={(e) =>
                              setNewKeyValues((prev) => ({
                                ...prev,
                                [provider.id]: e.target.value,
                              }))
                            }
                            className="bg-white/50 flex-1 h-9 text-sm border-black/20 focus:border-black/30 hover:border-black/25 transition-colors"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setVisibleKeys((prev) => ({
                                ...prev,
                                [provider.id]: !prev[provider.id],
                              }))
                            }
                            className="bg-white/50 h-9 w-9 hover:bg-white/60 transition-colors"
                          >
                            {isVisible ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 h-9 px-4 text-sm transition-colors"
                            onClick={() => handleUpdateKey(provider.id)}
                          >
                            Save
                          </Button>
                        </div>
                        <a
                          href={provider.apiLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs text-teal-600 hover:text-teal-700 underline underline-offset-2"
                        >
                          Get your {provider.name} API key →
                        </a>
                      </>
                    )}

                    {providerModels.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Available models:{" "}
                        {providerModels
                          .map(
                            (m) =>
                              `${m.name}${m.features.isUnstable ? " (Unstable)" : ""}`
                          )
                          .join(", ")}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
