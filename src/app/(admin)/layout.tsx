import {
    Sidebar
} from "@/components/Sidebar";

import {
    LogoutButton
} from "@/components/LogoutButton";

import {
    apiRequest
} from "@/lib/api";

import {
    requireUser
} from "@/lib/session";

import type {
    SystemSettings
} from "@/types";

export default async function Layout({
    children
}: {
    children: React.ReactNode;
}) {
    const user =
        await requireUser();

    const system =
        await apiRequest<SystemSettings>(
            "/admin/settings/system"
        );

    return (
        <div className="shell">
            <Sidebar
                system={system}
                user={user}
            />

            <div>
                <header className="topbar">
                    <span className="muted">
                        {system.system_name} - Administração central
                    </span>

                    <div className="user">
                        <div>
                            <strong>
                                {user.full_name}
                            </strong>

                            <br />

                            <span className="muted">
                                {user.profile_name}
                            </span>
                        </div>

                        <LogoutButton />
                    </div>
                </header>

                {children}
            </div>
        </div>
    );
}