'use client';

import WorkspaceSettingsSection from '@/components/settings/WorkspaceSettingsSection';
import SettingsTabPanel from '@/components/settings/SettingsTabPanel';
import ComingSoonPlaceholder from '@/components/settings/ComingSoonPlaceholder';
import SettingsNav from '@/components/settings/SettingsNav';
import { Tabs, TabsContent } from '@/components/ui/tabs';

export default function SettingsPage() {
    return (
        <div className="-m-4 flex min-h-[calc(100vh-3.5rem)] flex-col">
            <Tabs
                defaultValue="general"
                orientation="vertical"
                className="flex w-full flex-1 gap-0 flex-col lg:flex-row"
            >
                <SettingsNav />

                <div className="min-w-0 flex-1 overflow-auto bg-neutral-50/50 p-4">
                    <TabsContent value="general" className="mt-0">
                        <SettingsTabPanel
                            title="General"
                            description="Basic workspace and display preferences."
                        >
                            <ComingSoonPlaceholder />
                        </SettingsTabPanel>
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-0">
                        <SettingsTabPanel
                            title="Notifications"
                            description="Email and in-app alert preferences."
                        >
                            <ComingSoonPlaceholder />
                        </SettingsTabPanel>
                    </TabsContent>

                    <TabsContent value="workspace" className="mt-0">
                        <SettingsTabPanel
                            title="Workspace"
                            description="Workspace name, timezone, and defaults."
                        >
                            <WorkspaceSettingsSection />
                        </SettingsTabPanel>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
