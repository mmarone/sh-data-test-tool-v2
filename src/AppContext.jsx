import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { adminGql, cleanToken } from "./lib/graphql.js";

const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

const ENVS = ["sit", "uat"];
const tokenStorageKey = env => `starAdminToken:${env}`;

function readStoredTokens() {
  const map = {};
  for (const env of ENVS) map[env] = localStorage.getItem(tokenStorageKey(env)) || "";
  return map;
}

const LOG_ICONS = { ok: "✅", error: "❌", "": "🔵" };
let logSeq = 0;

export function AppProvider({ children }) {
  const [environment, setEnvironmentState] = useState("sit");
  const [tokens, setTokens] = useState(readStoredTokens);
  const [apiOnline, setApiOnline] = useState(false);
  const [logs, setLogs] = useState([]);

  // refs สำหรับ async flow ที่ค้างอยู่นาน (ไม่ให้ค่าเก่าค้างใน closure)
  const envRef = useRef(environment);
  envRef.current = environment;
  const tokensRef = useRef(tokens);
  tokensRef.current = tokens;

  const setEnvironment = useCallback(env => {
    envRef.current = env;
    setEnvironmentState(env);
  }, []);

  // เก็บค่าดิบไว้ใน state, เก็บค่าที่ clean แล้วลง localStorage (เหมือนเดิม)
  const setToken = useCallback((env, raw) => {
    const cleaned = cleanToken(raw);
    const key = tokenStorageKey(env);
    if (cleaned) localStorage.setItem(key, cleaned);
    else localStorage.removeItem(key);
    // อัปเดต ref ทันที (sync) ให้ async flow ที่ตามมาอ่านค่าล่าสุดได้
    const next = { ...tokensRef.current, [env]: raw };
    tokensRef.current = next;
    setTokens(next);
  }, []);

  const getToken = useCallback((env = envRef.current) => cleanToken(tokensRef.current[env] || ""), []);

  const log = useCallback((msg, type = "") => {
    const row = {
      id: ++logSeq,
      type,
      icon: LOG_ICONS[type] || "🔵",
      time: new Date().toLocaleTimeString(),
      msg: String(msg)
    };
    setLogs(list => [row, ...list].slice(0, 100));
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  // Admin GraphQL ที่ผูก token/environment ปัจจุบันให้แล้ว
  const gql = useCallback((query, variables, env = envRef.current) => {
    return adminGql(
      { environment: env, token: tokensRef.current[env] || "", log },
      query,
      variables
    );
  }, [log]);

  const value = useMemo(() => ({
    environment, setEnvironment, envRef,
    tokens, token: tokens[environment] || "", setToken, getToken,
    apiOnline, setApiOnline,
    logs, log, clearLogs,
    gql
  }), [environment, setEnvironment, tokens, setToken, getToken, apiOnline, logs, log, clearLogs, gql]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
