import ServicePageShell from '@/app/materials-tools/components/ServicePageShell';

export default function Page() {
  return (
    <ServicePageShell
      title="Equipment Repair & Maintenance"
      subtitle="Maintenance support for looms, carving tools, kiln systems, jewelry benches, and shared studio equipment."
      overview="Repair capacity is part of supply chain resilience. This page turns maintenance into a visible service layer so artists are not forced to replace tools they should be able to keep in circulation."
      primaryHref="/materials-tools/tool-library-application"
      primaryLabel="Apply to a tool library"
    />
  );
}

