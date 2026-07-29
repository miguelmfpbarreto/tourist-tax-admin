import { AccessDenied } from "@/components/AccessDenied";
import { hasPermission } from "@/lib/permissions";
import { requireUser } from "@/lib/session";

export async function PermissionGate({
    permission,
    children,
    message
}: {
    permission: string | readonly string[];
    children: React.ReactNode;
    message?: string;
}) {
    const user = await requireUser();

    if (!hasPermission(user, permission)) {
        const label = Array.isArray(permission)
            ? permission.join(" ou ")
            : permission;

        return (
            <AccessDenied
                message={message || `Sem permissão: ${label}.`}
            />
        );
    }

    return <>{children}</>;
}
