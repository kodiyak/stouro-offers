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

const schema = z.object({
  file: z.instanceof(File, { message: "File is required" }),
});

type FormValues = z.infer<typeof schema>;

interface CreateManifestProps extends UseDisclosure {}

export default function CreateManifest({
  isOpen,
  onOpenChange,
  onClose,
}: CreateManifestProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
  });
  const { isSubmitting, isDirty, isValid } = form.formState;

  const onSubmit = useMutationAPI({
    mutationFn: async (data: FormValues) => {
      console.log(data);
      await api.manifests.upload({
        file: data.file,
      });
      // Intentionally empty - implementation to be provided later
    },
    onSuccess: async () => {
      // onClose();
    },
    toast: {
      loading: () => ({
        title: "Enviando fixa...",
        description: "Estamos processando o seu arquivo.",
      }),
      success: () => ({
        title: "Fixa enviada!",
        description: "Seu arquivo foi enviado com sucesso.",
      }),
      error: ({ error }) => ({
        title: "Erro ao enviar fixa",
        description: error?.message || "Tente novamente mais tarde.",
      }),
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ file: undefined });
    }
  }, [isOpen]);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Enviar Ficha</DrawerTitle>
          <DrawerDescription>
            Envie um arquivo de manifesto para anexar à sua conta. Formato
            aceito: imagens.
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={form.handleSubmit((v) => onSubmit.mutateAsync(v as never))}
        >
          <FieldSet className="w-full px-4">
            <FieldGroup>
              <Controller
                name="file"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                    <Input
                      // {...field}
                      // value={field.value as never}
                      onChange={(e) => {
                        field.onChange((e.target as any).files[0]);
                      }}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      type={"file"}
                    />
                    <FieldDescription>Max. 5MB</FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* Intentionally left empty: file picker and drawer content to be implemented later */}
            </FieldGroup>
          </FieldSet>

          <DrawerFooter>
            <Button
              size={"lg"}
              className="rounded-full"
              type={"submit"}
              // disabled={isSubmitting || !isDirty || !isValid}
            >
              <PlusIcon />
              <span>Enviar Fixa</span>
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
