export default function OperatorFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-16">
      <div className="container mx-auto px-8 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-full flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[16px]">book_4</span>
          </div>
          <span className="text-md font-bold text-primary tracking-tight">LMS Greenfields</span>
        </div>
        <p className="text-slate-400 text-xs">© {new Date().getFullYear()} PT Greenfields Indonesia. All rights reserved.</p>
        <div className="flex gap-6 text-xs font-medium text-slate-500">
          <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
          <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
        </div>
      </div>
    </footer>
  );
}