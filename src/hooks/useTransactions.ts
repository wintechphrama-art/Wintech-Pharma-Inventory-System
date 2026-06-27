import { useEffect, useState, useCallback } from "react";

import type {
  MaterialTransaction,
  CreateTransactionInput,
  MaterialReturn,
  CreateReturnInput,
} from "@/types/transaction";

import {
  getTransactions,
  createTransaction as createTransactionService,
  getReturns,
  createReturn as createReturnService,
} from "@/services/supabase/transactions";

export function useTransactions() {
  const [transactions, setTransactions] = useState<
    MaterialTransaction[]
  >([]);
  const [returns, setReturns] = useState<MaterialReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [txns, rets] = await Promise.all([
        getTransactions(),
        getReturns(),
      ]);
      setTransactions(txns ?? []);
      setReturns(rets ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    const data = await getTransactions();
    setTransactions(data ?? []);
  }, []);

  const loadReturns = useCallback(async () => {
    const data = await getReturns();
    setReturns(data ?? []);
  }, []);

  async function createTransaction(data: CreateTransactionInput) {
    setMutating(true);
    try {
      const result = await createTransactionService(data);
      await loadAll();
      return result;
    } finally {
      setMutating(false);
    }
  }

  async function createMaterialReturn(data: CreateReturnInput) {
    setMutating(true);
    try {
      const result = await createReturnService(data);
      await loadAll();
      return result;
    } finally {
      setMutating(false);
    }
  }

  return {
    transactions,
    returns,
    loading,
    mutating,
    refresh: loadAll,
    refreshTransactions: loadTransactions,
    refreshReturns: loadReturns,
    createTransaction,
    createMaterialReturn,
  };
}
