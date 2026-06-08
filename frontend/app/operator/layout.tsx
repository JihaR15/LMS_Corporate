import OperatorHeader from "../components/layouts/OperatorHeader";
import OperatorFooter from  "../components/layouts/OperatorFooter";

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <OperatorHeader />
        <main>{children}</main>
      </div>
      <OperatorFooter />
    </div>
  );
}