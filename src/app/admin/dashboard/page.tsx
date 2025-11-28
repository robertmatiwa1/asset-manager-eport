import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";

export default async function AdminDashboardPage() {
  const { data: users } = await supabase.from("profiles").select("*");
  const { data: assets } = await supabase.from("assets").select("*");
  const { data: categories } = await supabase.from("categories").select("*");
  const { data: departments } = await supabase.from("departments").select("*");

  const totalValue =
    assets?.reduce((acc, asset) => acc + Number(asset.cost), 0) || 0;

  return (
    <AdminGuard>
      <main className="p-8 space-y-8">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 shadow rounded">
            <div className="text-muted">Users</div>
            <div className="text-3xl font-bold">{users?.length || 0}</div>
          </div>

          <div className="bg-white p-6 shadow rounded">
            <div className="text-muted">Assets</div>
            <div className="text-3xl font-bold">{assets?.length || 0}</div>
          </div>

          <div className="bg-white p-6 shadow rounded">
            <div className="text-muted">Categories</div>
            <div className="text-3xl font-bold">
              {categories?.length || 0}
            </div>
          </div>

          <div className="bg-white p-6 shadow rounded">
            <div className="text-muted">Departments</div>
            <div className="text-3xl font-bold">
              {departments?.length || 0}
            </div>
          </div>

          <div className="bg-white p-6 shadow rounded">
            <div className="text-muted">Total Asset Value</div>
            <div className="text-3xl font-bold">R {totalValue.toFixed(2)}</div>
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
