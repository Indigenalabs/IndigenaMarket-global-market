import ServicePageShell from '@/app/materials-tools/components/ServicePageShell';

export default function Page() {
  return (
    <ServicePageShell
      title="Material Sourcing Consultation"
      subtitle="Work with trusted suppliers to source culturally appropriate and traceable materials."
      overview="When a project needs the right material and a generic substitute will not do, sourcing support matters. This service helps artists navigate protocol-aware substitutions, availability, and supplier matching."
      primaryHref="/materials-tools/wishlist"
      primaryLabel="Post what you need"
    />
  );
}

