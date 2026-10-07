// O recharts 3 mudou a tipagem do Tooltip; este arquivo (apontado como "recharts" pelo Vite e tsconfig)
// exporta tudo do pacote original e redeclara o Tooltip com a tipagem do recharts 2, para que
// formatter={(v: number) => ...} e labelFormatter={(label: string) => ...} funcionem. Nada muda em execução.
// Pacote original: "recharts-upstream".
/* oxlint-disable react/only-export-components -- `export *` re-exports upstream components */
import type { ReactNode } from "react";
import {
  Tooltip as UpstreamTooltip,
  type TooltipPayloadEntry,
  type TooltipProps as UpstreamTooltipProps,
  type TooltipValueType,
} from "recharts-upstream";

export * from "recharts-upstream";

type NameType = string | number;
type UpstreamProps = UpstreamTooltipProps<TooltipValueType, NameType>;
type TooltipPayload = Parameters<NonNullable<UpstreamProps["labelFormatter"]>>[1];

/** recharts 2's Formatter: `value` is `TValue`, inferred from the callback the caller writes. */
export type TooltipFormatter<TValue extends TooltipValueType = TooltipValueType, TName extends NameType = NameType> = (
  value: TValue,
  name: TName,
  item: TooltipPayloadEntry,
  index: number,
  payload: TooltipPayload,
) => ReactNode | [ReactNode, ReactNode];

export function Tooltip<
  TValue extends TooltipValueType = TooltipValueType,
  TName extends NameType = NameType,
  TLabel = ReactNode,
>(
  props: Omit<UpstreamTooltipProps<TValue, TName>, "formatter" | "labelFormatter"> & {
    formatter?: TooltipFormatter<TValue, TName>;
    labelFormatter?: (label: TLabel, payload: TooltipPayload) => ReactNode;
  },
) {
  // Os parâmetros de tipo só restringem o que as funções declaram; o recharts 2 fazia o mesmo.
  return <UpstreamTooltip {...(props as UpstreamProps)} />;
}
