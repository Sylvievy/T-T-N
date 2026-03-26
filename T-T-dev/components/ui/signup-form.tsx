import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
// Removed: import Link from "next/link";

interface SignupFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

export function SignupForm({ onSubmit, error, isLoading }: SignupFormProps) {
  return (
    <div className="flex flex-col gap-6 bg-slate-200 text-slate-800 rounded-xl">
      <Card>
        <CardContent>
          <form onSubmit={onSubmit} className="p-4">
            <div className="flex flex-row gap-2 items-center justify-between py-3 text-lg">
              <img src="/akralogo.png" alt="logo" width="60" />
              <span className="font-bold">taskQ</span>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Enter your information below to create your account
            </p>

            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Full Name</Label>
                <Input id="username" name="username" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
