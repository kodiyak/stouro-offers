"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/clients/api";
import { type UseDisclosure, useMutationAPI } from "@/lib/hooks";
import { invalidateQueries } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

interface CreateCustomerProps extends UseDisclosure {}

export default function CreateCustomer({
  isOpen,
  onOpenChange,
  onClose,
}: CreateCustomerProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
  });

  const { isSubmitting, isDirty, isValid } = form.formState;

  const onSubmit = useMutationAPI({
    mutationFn: async (data: FormValues) => {
      return api.customers.create({ ...data });
    },
    onSuccess: async () => {
      await invalidateQueries(["customers"]);
      onClose();
    },
    toast: {
      loading: () => ({
        title: "Cadastrando cliente...",
        description: "Estamos cadastrando seu novo cliente.",
      }),
      success: () => ({
        title: "Cliente cadastrado!",
        description: "Seu cliente foi cadastrado com sucesso.",
      }),
      error: ({ error }) => ({
        title: "Erro ao cadastrar cliente",
        description: error?.message || "Tente novamente mais tarde.",
      }),
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: "",
        color: "#000000",
      });
    }
  }, [isOpen]);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Criar Cliente</DrawerTitle>
          <DrawerDescription>
            Preencha os campos abaixo para criar um novo cliente.
          </DrawerDescription>
        </DrawerHeader>
        <form
          onSubmit={form.handleSubmit((v) => onSubmit.mutateAsync(v as never))}
        >
          <FieldSet className="w-full px-4">
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder={"Fulano da Silva"}
                      autoComplete="off"
                    />
                    <FieldDescription>Nome do cliente</FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="color"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Cor</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      type="color"
                      placeholder="#000000"
                    />
                    <FieldDescription>
                      Cor associada ao cliente
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <DrawerFooter>
            <Button
              size={"lg"}
              className="rounded-full"
              type={"submit"}
              disabled={isSubmitting || !isDirty || !isValid}
            >
              <PlusIcon />
              <span>Cadastrar Cliente</span>
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
