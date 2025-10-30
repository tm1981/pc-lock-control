import { PcManagement } from "@/components/pc-management"
import { PcControlDashboard } from "@/components/pc-control-dashboard"
import { ScheduleManagement } from "@/components/schedule-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PcsDashboard() {
  return (
    <Tabs defaultValue="control">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="control">Control Dashboard</TabsTrigger>
        <TabsTrigger value="schedules">Schedules</TabsTrigger>
        <TabsTrigger value="management">PC Management</TabsTrigger>
      </TabsList>
      <TabsContent value="control">
        <PcControlDashboard />
      </TabsContent>
      <TabsContent value="schedules">
        <ScheduleManagement />
      </TabsContent>
      <TabsContent value="management">
        <PcManagement />
      </TabsContent>
    </Tabs>
  )
}
