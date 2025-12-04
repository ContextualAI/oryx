import { OryxChat } from "@/components/chat-interface";

export default function Page() {
  return (
    <div
      className={
        "w-full h-svh flex items-center justify-center bg-neutral-100 px-4 py-5 overflow-hidden"
      }
    >
      <OryxChat />
    </div>
  );
}
