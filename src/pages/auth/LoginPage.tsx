import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  loginSchema,
  type LoginFormData,
} from "@/lib/validators";

import { loginWithEmployeeCode } from "@/services/supabase/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(
    data: LoginFormData
  ) {
    try {
      setLoading(true);
      setError("");

      await loginWithEmployeeCode(
        data.employeeCode,
        data.password
      );

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:flex bg-slate-950 overflow-hidden">
        {/* Blurred Logo Background */}
        <div 
          className="absolute inset-0 z-0 opacity-40 blur-[1px] pointer-events-none"
          style={{
            backgroundImage: `url('/wintech-pharmachem-equipments-pvt-ltd-removebg-preview.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: 'scale(0.7)'
          }}
        />
        
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-blue-950/80 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-bold leading-tight">
              Wintech Pharmachem Equipments Pvt. Ltd.
            </h1>
          </div>

          <h2 className="text-3xl font-semibold mb-4">
            Raw Material Inventory
          </h2>

          <p className="max-w-md text-slate-300">
            Track raw materials, issue
            transactions, returns and stock
            movement across the factory.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2">
            Welcome Back
          </h2>

          <p className="mb-8 text-muted-foreground">
            Sign in using Employee ID
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div>
              <Input
                placeholder="Employee ID"
                {...register(
                  "employeeCode"
                )}
              />

              {errors.employeeCode && (
                <p className="mt-1 text-sm text-red-500">
                  {
                    errors.employeeCode
                      .message
                  }
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register("password")}
              />

              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {
                    errors.password
                      .message
                  }
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <Button
              className="w-full"
              disabled={loading}
            >
              <LogIn className="mr-2 h-4 w-4" />

              {loading
                ? "Signing In..."
                : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}