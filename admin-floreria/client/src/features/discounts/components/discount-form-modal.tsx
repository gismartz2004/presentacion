import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useEffect, useState } from "react";
import type { Discount, DiscountType, UpdateDiscountPayload } from "../types";

type Props = {
  discount?: Discount | null; // null → crear, con data → editar
  onSave?: (formData: Omit<UpdateDiscountPayload, "id">) => void;
  trigger: React.ReactNode;
  discountTypes: DiscountType[];
  updateDiscounts?: (discountData : UpdateDiscountPayload) => void;
};

export function DiscountFormModal({ discount, onSave, trigger, discountTypes, updateDiscounts }: Props) {
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState(0);
  const [description, setDescription] = useState("");
  const [typeId, setTypeId] = useState<number>(1);
  const [startsAt, setStartsAt] = useState<string>("");
  const [endsAt, setEndsAt] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [generateCode, setGenerateCode] = useState<boolean>(false);
  const [maxUses, setMaxUses] = useState<string>("");

  const toDateTimeLocalValue = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
    const local = new Date(d.getTime() - tzOffsetMs);
    return local.toISOString().slice(0, 16);
  };

  const toIsoOrNull = (dtLocal: string) => {
    if (!dtLocal) return null;
    const d = new Date(dtLocal);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  useEffect(() => {
    if (discount) {
      setPercent(discount.percent);
      setDescription(discount.description);
      setTypeId(discount.discount_types.id);
      setStartsAt(toDateTimeLocalValue(discount.starts_at));
      setEndsAt(toDateTimeLocalValue(discount.ends_at));
      setCode(discount.code ?? "");
      setGenerateCode(false);
      setMaxUses(discount.max_uses != null ? String(discount.max_uses) : "");
    } else {
      setPercent(0);
      setDescription("");
      setTypeId(discountTypes[0]?.id || 1);
      setStartsAt("");
      setEndsAt("");
      setCode("");
      setGenerateCode(false);
      setMaxUses("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discount]);

  const handleSubmit = () => {
    const payloadBase = {
      percent,
      description,
      discount_type: typeId,
      starts_at: typeId !== 2 ? toIsoOrNull(startsAt) : null,
      ends_at: typeId !== 2 ? toIsoOrNull(endsAt) : null,
      code: generateCode ? null : (code || null),
      generate_code: generateCode,
      max_uses: maxUses ? Number(maxUses) : null,
    };

    if (discount) {
      updateDiscounts?.({ 
        id: discount.id, 
        ...payloadBase,
      });
    } else {
       onSave?.({ 
        ...payloadBase,
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {discount ? "Editar descuento" : "Crear descuento"}
          </DialogTitle>
        </DialogHeader>

        {/* FORM */}
        <div className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-sm font-medium">Porcentaje</label>
            <input
              type="number"
              className="border rounded-md w-full px-2 py-1 mt-1"
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <textarea
                className="border rounded-md w-full px-2 py-2 mt-1  min-h-[80px] resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
        />
        </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
                className="border rounded-md w-full px-2 py-1 mt-1"
                value={typeId}
                onChange={(e) => setTypeId(Number(e.target.value))}
            >
                {discountTypes.map((dt) => (
                    <option key={dt.id} className="text-black" value={dt.id}>
                        {dt.type_name}
                    </option>
                ))}
            </select>
          </div>
          {typeId !== 2 &&
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Desde</label>
                <input
                  type="datetime-local"
                  className="border rounded-md w-full px-2 py-1 mt-1"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Hasta</label>
                <input
                  type="datetime-local"
                  className="border rounded-md w-full px-2 py-1 mt-1"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            </div>
          }

          {/* <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Prioridad</label>
              <input
                type="number"
                className="border rounded-md w-full px-2 py-1 mt-1"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium mt-1">
                <input
                  type="checkbox"
                  checked={stackable}
                  onChange={(e) => setStackable(e.target.checked)}
                />
                Acumulable
              </label>
            </div>
          </div> */}
          {typeId === 4 &&
            <div>
              {!generateCode &&
                <div>
                  <label className="text-sm font-medium">Código (opcional)</label>
                  <input
                    type="text"
                    className="border rounded-md w-full px-2 py-1 mt-1"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={generateCode}
                    placeholder="Ej: NAVIDAD2025"
                  />
                </div> 
              }
              <label className="flex items-center gap-2 text-sm mt-2">
                <input
                  type="checkbox"
                  checked={generateCode}
                  onChange={(e) => setGenerateCode(e.target.checked)}
                />
                Generar código automáticamente
              </label>
            </div>
          }

          <div>
            <label className="text-sm font-medium">Máx. usos (opcional)</label>
            <input
              type="number"
              className="border rounded-md w-full px-2 py-1 mt-1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Sin límite"
              min={0}
            />
          </div>

          <button
            className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 mt-3"
            onClick={handleSubmit}
          >
            Guardar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
