"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
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
  price: z
    .string()
    .transform((val) => Number(val.split(",").join(".")))
    .refine((val) => val >= 0, {
      message: "Price must be a non-negative number",
    }),
});

type FormValues = z.infer<typeof schema>;

interface CreateProductProps extends UseDisclosure {
  customerId: string;
}

export default function CreateProduct({
  isOpen,
  onOpenChange,
  onClose,
  customerId,
}: CreateProductProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
  });
  const { isSubmitting, isDirty, isValid } = form.formState;

  const onSubmit = useMutationAPI({
    mutationFn: async (data: FormValues) => {
      return api.customers.addProduct({
        customerId,
        ...data,
      });
    },
    onSuccess: async () => {
      await invalidateQueries(["customers", customerId, "products"]);
      onClose();
    },
    toast: {
      loading: () => ({
        title: "Cadastrando produto...",
        description: "Estamos cadastrando seu novo produto.",
      }),
      success: () => ({
        title: "Produto cadastrado!",
        description: "Seu produto foi cadastrado com sucesso.",
      }),
      error: ({ error }) => ({
        title: "Erro ao cadastrar produto",
        description: error?.message || "Tente novamente mais tarde.",
      }),
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: "",
        price: 0,
      });
    }
  }, [isOpen]);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Criar Produto</DrawerTitle>
          <DrawerDescription>
            Preencha os campos abaixo para criar um novo produto.
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
                      placeholder={"Camisa Polo, Canarinho, etc..."}
                      autoComplete="off"
                    />
                    <FieldDescription>Título do produto</FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Preço</FieldLabel>
                    <CurrencyInput
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Login button not working on mobile"
                      autoComplete="off"
                    />
                    <FieldDescription>
                      Provide a concise title for your bug report.
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
              <span>Cadastrar Produto</span>
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
