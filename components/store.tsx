"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type Caregiver = { id: number; name: string; email: string; phone: string };
export type Client = {
  id: number;
  name: string;
  dob: string;
  medications: string;
  insuranceCompany: string;
  policyNumber: string;
  allergies: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  reason: string;
};

export type Log = {
  id: number;
  caregiverId: number | null;
  caregiverName: string;
  clientId: number | null;
  clientName: string;
  date: string;
  bp: string;
  meals: { b: "Yes" | "No"; l: "Yes" | "No"; d: "Yes" | "No" };
  visits: { ot: "Yes" | "No"; pt: "Yes" | "No"; n: "Yes" | "No" };
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type Store = {
  caregivers: Caregiver[];
  clients: Client[];
  logs: Log[];
  addCaregiver: (c: Omit<Caregiver, "id">) => void;
  updateCaregiver: (id: number, c: Omit<Caregiver, "id">) => void;
  deleteCaregiver: (id: number) => void;

  addClient: (c: Omit<Client, "id">) => void;
  updateClient: (id: number, c: Omit<Client, "id">) => void;
  deleteClient: (id: number) => void;

  addLog: (l: Omit<Log, "id" | "createdAt" | "updatedAt" | "caregiverName" | "clientName">) => void;
  updateLog: (id: number, l: Omit<Log, "id" | "createdAt" | "updatedAt" | "caregiverName" | "clientName">) => void;
};

const Ctx = createContext<Store | null>(null);

function nowIso() {
  return new Date().toISOString();
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([
    { id: 1, name: "Ava Carter", email: "ava@example.com", phone: "(555) 111-2222" },
    { id: 2, name: "Malik Johnson", email: "malik@example.com", phone: "(555) 333-4444" },
  ]);
  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      name: "Lola Smith",
      dob: "1940-04-19",
      medications: "Amlodipine 5mg daily",
      insuranceCompany: "Blue Cross Blue Shield",
      policyNumber: "BCBS-12345",
      allergies: "Penicillin",
      emergencyContactName: "Jordan Smith",
      emergencyContactPhone: "(555) 222-3333",
      reason: "Mobility assistance",
    },
    {
      id: 2,
      name: "John Doe",
      dob: "1938-10-02",
      medications: "Metformin 500mg twice daily",
      insuranceCompany: "UnitedHealthcare",
      policyNumber: "UHC-67890",
      allergies: "None",
      emergencyContactName: "Casey Doe",
      emergencyContactPhone: "(555) 444-5555",
      reason: "Post-surgery recovery",
    },
  ]);
  const [logs, setLogs] = useState<Log[]>([
    {
      id: 1,
      caregiverId: 1,
      caregiverName: "Ava Carter",
      clientId: 1,
      clientName: "Lola Smith",
      date: "2026-01-05",
      bp: "120/80",
      meals: { b: "Yes", l: "Yes", d: "No" },
      visits: { ot: "Yes", pt: "No", n: "No" },
      notes: "Slept well",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: 2,
      caregiverId: 2,
      caregiverName: "Malik Johnson",
      clientId: 2,
      clientName: "John Doe",
      date: "2026-01-06",
      bp: "118/78",
      meals: { b: "Yes", l: "Yes", d: "Yes" },
      visits: { ot: "No", pt: "No", n: "Yes" },
      notes: "Good day",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]);

  const nextId = (arr: { id: number }[]) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1);

  const addCaregiver: Store["addCaregiver"] = (c) =>
    setCaregivers((prev) => [...prev, { id: nextId(prev), ...c }]);

  const updateCaregiver: Store["updateCaregiver"] = (id, c) =>
    setCaregivers((prev) => prev.map((x) => (x.id === id ? { id, ...c } : x)));

  const deleteCaregiver: Store["deleteCaregiver"] = (id) =>
    setCaregivers((prev) => prev.filter((x) => x.id !== id));

  const addClient: Store["addClient"] = (c) => setClients((prev) => [...prev, { id: nextId(prev), ...c }]);
  const updateClient: Store["updateClient"] = (id, c) =>
    setClients((prev) => prev.map((x) => (x.id === id ? { id, ...c } : x)));
  const deleteClient: Store["deleteClient"] = (id) => setClients((prev) => prev.filter((x) => x.id !== id));

  const addLog: Store["addLog"] = (l) => {
    setLogs((prev) => {
      const cg = caregivers.find((c) => c.id === l.caregiverId);
      const cl = clients.find((c) => c.id === l.clientId);
      return [
        ...prev,
        {
          id: nextId(prev),
          ...l,
          caregiverName: cg?.name ?? "Unknown caregiver",
          clientName: cl?.name ?? "Unknown client",
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ];
    });
  };

  const updateLog: Store["updateLog"] = (id, l) => {
    setLogs((prev) => {
      const cg = caregivers.find((c) => c.id === l.caregiverId);
      const cl = clients.find((c) => c.id === l.clientId);
      return prev.map((x) =>
        x.id === id
          ? {
              ...x,
              ...l,
              // Option B: snapshot names do NOT rewrite old logs on rename; but edits rewrite snapshot at edit time.
              caregiverName: cg?.name ?? x.caregiverName,
              clientName: cl?.name ?? x.clientName,
              updatedAt: nowIso(),
            }
          : x
      );
    });
  };

  const value = useMemo<Store>(
    () => ({
      caregivers,
      clients,
      logs,
      addCaregiver,
      updateCaregiver,
      deleteCaregiver,
      addClient,
      updateClient,
      deleteClient,
      addLog,
      updateLog,
    }),
    [caregivers, clients, logs]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("StoreProvider missing");
  return v;
}
