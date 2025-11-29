"use client";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
};

export default function Modal({ open, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md space-y-4 animate-fadeIn">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
}
