"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore(); 

  // Đảm bảo đồng bộ Server-Client
  useEffect(() => {
    // Dùng setTimeout để đưa việc cập nhật state ra khỏi luồng đồng bộ
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    // Cleanup timer khi component unmount
    return () => clearTimeout(timer);
  }, []);

  // Lắng nghe sự thay đổi của state user
  useEffect(() => {
    // Nếu app đã load xong trên client mà không có user -> Đá về login
    if (mounted && !user) {
      router.push("/login");
    }
  }, [mounted, user, router]);

  // Đang load ban đầu HOẶC đang trong quá trình bị đá về trang login
  // Sẽ không render children (Dashboard) ra để bảo mật
  if (!mounted || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Nếu có user thì mới cho phép render các thành phần bên trong Dashboard
  return <>{children}</>;
}