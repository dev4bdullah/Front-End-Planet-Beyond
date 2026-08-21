import { Card, Skeleton } from "@ui";
import { RevenueArea, CategoryDonut } from "@tasks/task-06-charts-and-analytics/components/charts";

/* Split into its own file so the lazy() boundary in Page.jsx has something to
   split on — this is the module that pulls recharts into the graph. */

export default function DashboardCharts({ series, categories, loading }) {
  if (loading) {
    return (
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {[0, 1].map(index => (
          <Card key={index}>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-64 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  const total = series.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Card>
        <Card.Header
          title="Revenue"
          subtitle={`${series.length} months · ${new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
          }).format(total)} total`}
        />
        <Card.Body>
          <div className="h-64">
            <RevenueArea data={series} />
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header title="By category" subtitle="Share of revenue" />
        <Card.Body>
          <div className="h-64">
            <CategoryDonut data={categories} />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
