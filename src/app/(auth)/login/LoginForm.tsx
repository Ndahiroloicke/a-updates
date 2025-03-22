"use client"

import LoadingButton from "@/components/LoadingButton"
import { PasswordInput } from "@/components/PasswordInput"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { loginSchema, type LoginValues } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { login } from "./actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { z } from "zod"

export default function LoginForm() {
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  const form = useForm<LoginValues & { keepLoggedIn: boolean }>({
    resolver: zodResolver(loginSchema.extend({ keepLoggedIn: z.boolean().default(false) })),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      keepLoggedIn: false,
    },
  })

  async function onSubmit(values: LoginValues & { keepLoggedIn: boolean }) {
    setError(undefined)
    startTransition(async () => {
      const { error } = await login({ ...values, keepLoggedIn: values.keepLoggedIn })
      if (error) setError(error)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="text-center text-destructive text-sm">{error}</p>}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Username"
                  {...field}
                  className="h-11 bg-gray-100 dark:bg-gray-700 border-0 rounded-sm dark:text-white dark:placeholder-gray-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Email"
                  type="email"
                  {...field}
                  className="h-11 bg-gray-100 dark:bg-gray-700 border-0 rounded-sm dark:text-white dark:placeholder-gray-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput
                  placeholder="Password"
                  {...field}
                  className="h-11 bg-gray-100 dark:bg-gray-700 border-0 rounded-sm dark:text-white dark:placeholder-gray-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="keepLoggedIn"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} id="keepLoggedIn" />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label htmlFor="keepLoggedIn" className="text-sm text-gray-600 dark:text-gray-300">
                  Keep me logged in
                </Label>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Stay signed in for 10 days. You will be logged out after 10 days of inactivity. Not recommended for
                  shared devices.
                </p>
              </div>
            </FormItem>
          )}
        />
        <LoadingButton
          loading={isPending}
          type="submit"
          className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm"
        >
          Sign in
        </LoadingButton>
      </form>
    </Form>
  )
}

