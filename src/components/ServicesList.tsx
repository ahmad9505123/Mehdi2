import { useState } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Plus } from 'lucide-react';
import { servicesQuery, useLiveServices } from '@/lib/services-query';
import { deleteService, setServiceAvailability } from '@/lib/services.functions';
import type { Service } from '@/lib/service-schema';
import AvailabilityToggle from './AvailabilityToggle';
import { AdminActions, EditButton, ServiceDialog } from './AdminEditors';
export default function ServicesList({ admin = false }: { admin?: boolean }) {
  const { data } = useSuspenseQuery(servicesQuery);
  useLiveServices();
  const queryClient = useQueryClient();
  const setAvailability = useServerFn(setServiceAvailability);
  const removeService = useServerFn(deleteService);
  const [editing, setEditing] = useState<{ service?: Service; key: number } | null>(null);
  if (!data.length && !admin) return null;
  return <section className="services-section"><div className="container"><div className="section-heading"><div><p className="section-kicker">مهدي خدماتي</p><h2>الخدمات والأسعار</h2></div>{admin && <button type="button" className="admin-add" onClick={() => setEditing({ key: Date.now() })}><Plus size={15} /> إضافة خدمة</button>}</div><div className="services-grid">{data.map(service => <article className={`service-item ${service.available ? '' : 'is-unavailable'}`} key={service.id}>{admin && <AvailabilityToggle label={service.name} available={service.available} onChange={async (available) => { await setAvailability({ data: { id: service.id, available } }); await queryClient.invalidateQueries({ queryKey: ['services'] }); }} />}<h3>{service.name}{admin && <EditButton label={service.name} onClick={() => setEditing({ service, key: Date.now() })} />}</h3><strong>{service.price === null ? 'السعر حسب الطلب' : `${service.price} ${service.currency}`}{admin && <EditButton label={`سعر ${service.name}`} onClick={() => setEditing({ service, key: Date.now() })} />}</strong><span className={service.available ? 'service-available' : 'service-unavailable'}>{service.available ? 'متاحة' : 'غير متاحة'}</span>{admin && <AdminActions name={service.name} onEdit={() => setEditing({ service, key: Date.now() })} onDelete={async () => { await removeService({ data: { id: service.id } }); await queryClient.invalidateQueries({ queryKey: ['services'] }); }} />}</article>)}</div>{admin && !data.length && <p className="admin-empty">لا توجد خدمات بعد — اضغط «إضافة خدمة».</p>}</div>{editing && <ServiceDialog key={editing.key} open onClose={() => setEditing(null)} service={editing.service} />}</section>;
}
