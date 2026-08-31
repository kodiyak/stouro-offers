"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UploadIcon } from "lucide-react";
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
  file: z.instanceof(File, { message: "File is required" }),
});

type FormValues = z.infer<typeof schema>;

interface AddManifestDrawerProps extends UseDisclosure {
  orderId: string;
}

export default function AddManifestDrawer({
  isOpen,
  onOpenChange,
  onClose,
  orderId,
}: AddManifestDrawerProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
  });
  const { isSubmitting, isDirty, isValid } = form.formState;

  const onSubmit = useMutationAPI({
    mutationFn: async (data: FormValues) => {
      return api.orders.addManifest({ orderId, file: data.file });
    },
    onSuccess: async () => {
      await invalidateQueries(["orders", orderId]);
      onClose();
    },
    toast: {
      loading: () => ({
        title: "Processando romaneio...",
        description: "A IA está extraindo os itens da imagem.",
      }),
      success: ({ data }) => ({
        title: "Romaneio processado!",
        description: `${data?.addedItems ?? 0} itens adicionados${
          data?.createdProducts
            ? `, ${data.createdProducts} novos produtos`
            : ""
        }.`,
      }),
      error: ({ error }) => ({
        title: "Erro ao processar romaneio",
        description: error?.message || "Tente novamente mais tarde.",
      }),
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ file: undefined });
    }
  }, [isOpen, form]);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Adicionar Romaneio</DrawerTitle>
          <DrawerDescription>
            Envie a foto do romaneio. A IA extrai os itens e adiciona ao pedido.
            Formato aceito: imagens até 5MB.
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
                    <FieldLabel htmlFor={field.name}>
                      Imagem do romaneio
                    </FieldLabel>
                    <Input
                      onChange={(e) => {
                        const input = e.target as unknown as {
                          files?: FileList | null;
                        };
                        field.onChange(input.files?.[0] as File);
                      }}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      type={"file"}
                      accept="image/*"
                    />
                    <FieldDescription>Max. 5MB</FieldDescription>
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
              <UploadIcon />
              <span>Processar Romaneio</span>
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
