"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const inputClass =
  "h-9 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

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

  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  useEffect(() => {
    const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedKeys) {
      try {
        setApiKeys(JSON.parse(storedKeys));
      } catch {
        /* ignore */
      }
    }

    const storedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    if (storedModel) {
      setDefaultModel(storedModel);
    } else if (isProPlan) {
      setDefaultModel(MODEL_DESIGNATIONS.DEFAULT_PRO);
      localStorage.setItem(MODEL_STORAGE_KEY, MODEL_DESIGNATIONS.DEFAULT_PRO);
    } else {
      setDefaultModel(MODEL_DESIGNATIONS.DEFAULT_FREE);
      localStorage.setItem(MODEL_STORAGE_KEY, MODEL_DESIGNATIONS.DEFAULT_FREE);
    }

    const storedOllamaUrl = localStorage.getItem(OLLAMA_URL_KEY);
    if (storedOllamaUrl) setOllamaUrl(storedOllamaUrl);

    const storedOllamaModels = localStorage.getItem(OLLAMA_MODELS_KEY);
    if (storedOllamaModels) {
      try {
        setOllamaModels(JSON.parse(storedOllamaModels));
      } catch {
        /* ignore */
      }
    }

    setHasLoaded(true);
  }, [isProPlan]);

  useEffect(() => {
    if (hasLoaded)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apiKeys));
  }, [apiKeys, hasLoaded]);

  useEffect(() => {
    if (defaultModel) localStorage.setItem(MODEL_STORAGE_KEY, defaultModel);
  }, [defaultModel]);

  const handleUpdateKey = (service: ServiceName) => {
    const keyValue = newKeyValues[service];
    if (!keyValue?.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    const normalizedKey = replaceSpecialCharacters(keyValue.trim());
    const newKey: ApiKey = {
      service,
      key: normalizedKey,
      addedAt: new Date().toISOString(),
    };

    setApiKeys((prev) => {
      const idx = prev.findIndex((k) => k.service === service);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = newKey;
        return u;
      }
      return [...prev, newKey];
    });

    const autoModel = (() => {
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
    })();
    if (autoModel !== defaultModel) {
      setDefaultModel(autoModel);
      toast.success(
        `Default model set to ${AI_MODELS.find((m) => m.id === autoModel)?.name}`
      );
    }

    setNewKeyValues((prev) => ({ ...prev, [service]: "" }));
    toast.success("API key saved");
  };

  const handleRemoveKey = (service: ServiceName) => {
    setApiKeys((prev) => prev.filter((k) => k.service !== service));
    setVisibleKeys((prev) => {
      const u = { ...prev };
      delete u[service];
      return u;
    });

    const currentModel = AI_MODELS.find((m) => m.id === defaultModel);
    if (currentModel?.provider === service) {
      const fallback = AI_MODELS.find((m) =>
        apiKeys.some((k) => k.service === m.provider && k.service !== service)
      );
      setDefaultModel(fallback?.id ?? "");
      toast.info(
        fallback
          ? `Switched to ${fallback.name}`
          : "No models available. Add an API key."
      );
    }
    toast.success("API key removed");
  };

  const getExistingKey = (service: ServiceName) =>
    apiKeys.find((k) => k.service === service);

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
    toast[models.length === 0 ? "info" : "success"](
      models.length === 0
        ? "Connected but no models found. Run: ollama pull llama3.2"
        : `Found ${models.length} Ollama model${models.length !== 1 ? "s" : ""}`
    );
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

  // Reusable provider row (used for stable + unstable providers)
  const ProviderRow = ({
    provider,
    unstable = false,
  }: {
    provider: ReturnType<typeof getProvidersArray>[number];
    unstable?: boolean;
  }) => {
    const existingKey = getExistingKey(provider.id);
    const isVisible = visibleKeys[provider.id];
    const providerModels = AI_MODELS.filter((m) => m.provider === provider.id);

    return (
      <div
        className={cn(
          "p-4 rounded-lg border bg-white transition-colors duration-150 hover:border-gray-300",
          unstable ? "border-amber-200" : "border-gray-200"
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {provider.name}
            </span>
            {unstable && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                Unstable
              </span>
            )}
          </div>
          {existingKey && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setVisibleKeys((p) => ({
                    ...p,
                    [provider.id]: !p[provider.id],
                  }))
                }
                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700 transition-colors duration-150"
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
                onClick={() => handleCopyKey(provider.id, existingKey.key)}
                className={cn(
                  "h-7 w-7 p-0 transition-colors duration-150",
                  copiedKey === provider.id
                    ? "text-emerald-500"
                    : "text-gray-400 hover:text-gray-700"
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
                className="h-7 px-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
              >
                Remove
              </Button>
            </div>
          )}
        </div>

        {existingKey ? (
          <div className="space-y-1.5">
            <p className="text-xs text-gray-400">
              Added {new Date(existingKey.addedAt).toLocaleDateString()}
            </p>
            {isVisible && (
              <div className="font-mono text-xs bg-gray-50 border border-gray-200 px-3 py-2 rounded-md break-all text-gray-700">
                {existingKey.key}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type={isVisible ? "text" : "password"}
                placeholder="Enter API key"
                value={newKeyValues[provider.id] || ""}
                onChange={(e) =>
                  setNewKeyValues((p) => ({
                    ...p,
                    [provider.id]: e.target.value,
                  }))
                }
                className={inputClass + " flex-1"}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setVisibleKeys((p) => ({
                    ...p,
                    [provider.id]: !p[provider.id],
                  }))
                }
                className="h-9 w-9 border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                {isVisible ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                className="bg-gray-900 text-white hover:bg-gray-700 h-9 px-4 text-sm transition-colors duration-150"
                onClick={() => handleUpdateKey(provider.id)}
              >
                Save
              </Button>
            </div>
            <a
              href={provider.apiLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors duration-150"
            >
              Get your {provider.name} API key →
            </a>
          </div>
        )}

        {providerModels.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            Models:{" "}
            {providerModels
              .map((m) => m.name + (m.features.isUnstable ? " (unstable)" : ""))
              .join(", ")}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Default Model */}
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-900">Default AI Model</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Used for all AI operations. All models require their API key.
          </p>
        </div>
        <ModelSelector
          value={defaultModel}
          onValueChange={setDefaultModel}
          apiKeys={apiKeys}
          isProPlan={isProPlan}
          className="w-full"
          placeholder="Select an AI model"
          ollamaModels={ollamaModels}
        />
      </div>

      <div className="h-px bg-gray-100" />

      {/* API Keys */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-900">API Keys</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Keys are stored locally in your browser.
          </p>
        </div>

        {isProPlan && (
          <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-500">
            <strong className="text-gray-700">Pro account active</strong> — you
            have full access without managing API keys. You can still add
            personal keys below if preferred.
          </div>
        )}

        <div className="space-y-2">
          {getProvidersArray()
            .filter((p) => !p.unstable)
            .map((provider) => (
              <ProviderRow key={provider.id} provider={provider} />
            ))}
        </div>

        {/* Ollama */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Ollama (Local AI)
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Run models locally — free, private, no API key needed. Requires{" "}
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-gray-600 transition-colors duration-150"
              >
                Ollama
              </a>{" "}
              installed and running.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-white space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">
                Ollama URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className={inputClass + " flex-1 font-mono"}
                />
                <Button
                  className="bg-gray-900 text-white hover:bg-gray-700 h-9 px-4 text-sm gap-1.5 transition-colors duration-150"
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
            </div>

            {ollamaError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                {ollamaError}. Make sure Ollama is running and the URL is
                correct.
              </p>
            )}

            {ollamaModels.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700">
                    {ollamaModels.length} model
                    {ollamaModels.length !== 1 ? "s" : ""} connected
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearOllama}
                    className="h-6 px-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    Disconnect
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ollamaModels.map((model) => (
                    <span
                      key={model}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs font-mono"
                    >
                      {model}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  Select an Ollama model from the{" "}
                  <strong className="text-gray-600">Default AI Model</strong>{" "}
                  dropdown above.
                </p>
              </div>
            )}

            {ollamaModels.length === 0 && !ollamaError && (
              <p className="text-xs text-gray-400">
                Pull models with{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600 font-mono">
                  ollama pull llama3.2
                </code>
                , then click Connect.
              </p>
            )}
          </div>
        </div>

        {/* Unstable providers */}
        {getProvidersArray().some((p) => p.unstable) && (
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <strong>Experimental providers</strong> — may experience errors or
              intermittent service. Use stable providers above for critical
              work.
            </div>
            <div className="space-y-2">
              {getProvidersArray()
                .filter((p) => p.unstable)
                .map((provider) => (
                  <ProviderRow key={provider.id} provider={provider} unstable />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
