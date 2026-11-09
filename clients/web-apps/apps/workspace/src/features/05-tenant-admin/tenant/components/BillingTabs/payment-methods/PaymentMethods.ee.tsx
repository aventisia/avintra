import { Badge } from "@avplatform/ui/badge";
import { MetaLine } from "@avplatform/ui/meta-line";
import { RecordEmpty, RecordSection } from "@avplatform/ui/record-sheet";
import { CreditCardIcon } from "@phosphor-icons/react";

import {
  CardNetworkTypesEnum,
  PaymentMethodDTO,
  PaymentMethodTypesEnum,
} from "@/features/05-tenant-admin/tenant/dtos/payment-methods-dto.ee";
import { useFetchPaymentMethods } from "@/features/05-tenant-admin/tenant/hooks/useFetchPaymentMethods.ee";

import VisaLogo from "../../../assets/payment-methods/visa.svg";
import TabLoader from "../TabLoader.ee";
import PaymentMethodsDialog from "./PaymentMethodsDialog.ee";

const CardMark = ({ network }: { network?: CardNetworkTypesEnum }) => (
  <span className="grid h-9 w-14 shrink-0 place-items-center rounded-md bg-surface shadow-sm ring-1 ring-line">
    {network === CardNetworkTypesEnum.Visa ? (
      <img src={VisaLogo} alt="Visa" className="h-3.5" />
    ) : (
      <CreditCardIcon className="size-5 text-ink-2" />
    )}
  </span>
);

const SavedCard = ({ card }: { card: PaymentMethodDTO }) => (
  <li className="flex items-center gap-3.5 rounded-lg bg-surface p-4 ring-1 ring-line">
    <CardMark network={card.cardNetwork} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-[13px] font-medium text-ink">
        {[card.cardNetwork, card.cardType?.toLowerCase(), "card"].filter(Boolean).join(" ")}
      </p>
      <MetaLine
        className="text-[12px] text-muted-foreground"
        items={[
          card.cardLast4 && (
            <span className="font-mono tabular-nums tracking-wider">•••• {card.cardLast4}</span>
          ),
          card.cardIssuer,
        ]}
      />
    </div>
    {card.cardInternational && <Badge variant="outline">International</Badge>}
  </li>
);

const PaymentMethods = () => {
  const { data, isLoading } = useFetchPaymentMethods();
  const cards = data?.data?.filter((method) => method.type === PaymentMethodTypesEnum.Card) ?? [];

  if (isLoading) return <TabLoader />;

  return (
    <>
      <RecordSection title="Saved cards" count={cards.length}>
        {cards.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <SavedCard key={card.id} card={card} />
            ))}
          </ul>
        ) : (
          <RecordEmpty mark={<CreditCardIcon className="size-5 text-muted-foreground" />}>
            No saved cards yet.
          </RecordEmpty>
        )}
      </RecordSection>
      <PaymentMethodsDialog />
    </>
  );
};

export default PaymentMethods;
