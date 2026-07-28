import { ResourceList } from "@/components/features/resource-list";
import { MidtransCheckout } from "@/components/payments/midtrans-checkout";
export default function Page() { return <><MidtransCheckout /><ResourceList resource="payments" /></>; }
