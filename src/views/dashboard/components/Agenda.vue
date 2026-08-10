<script setup>
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { hasPermission } from '@/services/authSession';

const toast = useToast();
const confirm = useConfirm();
const cursor = ref(new Date());
const tasks = ref([]);
const services = ref([]);
const sales = ref([]);
const loading = ref(false);
const dialog = ref(false);
const editingId = ref(null);
const form = ref({ title: '', description: '', starts_at: '', ends_at: '', color: '#3B82F6', service_id: null, sale_id: null, recurrence_rule: 'none', recurrence_until: '', completed: false });
const monthLabel = computed(() => cursor.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
const pad = (value) => String(value).padStart(2, '0');
const dateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toLocalInput = (value) => { const date = new Date(value); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; };
const days = computed(() => {
    const first = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1);
    const start = new Date(first); start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return { date, key: dateKey(date), current: date.getMonth() === cursor.value.getMonth() }; });
});
const tasksFor = (key) => tasks.value.filter((task) => dateKey(new Date(task.starts_at)) === key);
const reset = (date = new Date()) => { editingId.value = null; form.value = { title: '', description: '', starts_at: `${dateKey(date)}T09:00`, ends_at: '', color: '#3B82F6', service_id: null, sale_id: null, recurrence_rule: 'none', recurrence_until: '', completed: false }; };
const range = () => { const from = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1); const to = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 1); return { from: from.toISOString(), to: to.toISOString() }; };
const load = async () => { loading.value = true; try { const { from, to } = range(); const requests = [Axios.get(`${API_CONFIG.AGENDA}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)]; if (hasPermission('servicos.acesso')) requests.push(Axios.get(API_CONFIG.SERVICES)); if (hasPermission('vendas.acesso')) requests.push(Axios.get(API_CONFIG.SALES)); const responses = await Promise.all(requests); tasks.value = responses[0].data || []; let index = 1; services.value = hasPermission('servicos.acesso') ? (responses[index++]?.data || []) : []; sales.value = hasPermission('vendas.acesso') ? (responses[index]?.data || []) : []; } catch (error) { toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao carregar agenda.', life: 5000 }); } finally { loading.value = false; } };
const openNew = (date = new Date()) => { reset(date); dialog.value = true; };
const openEdit = (task) => { editingId.value = task.id; form.value = { title: task.title, description: task.description || '', starts_at: toLocalInput(task.starts_at), ends_at: task.ends_at ? toLocalInput(task.ends_at) : '', color: task.color || '#3B82F6', service_id: task.service_id, sale_id: task.sale_id, recurrence_rule: task.recurrence_rule || 'none', recurrence_until: task.recurrence_until ? String(task.recurrence_until).slice(0, 10) : '', completed: task.completed }; dialog.value = true; };
const save = async () => { if (!form.value.title.trim() || !form.value.starts_at) return toast.add({ severity: 'warn', summary: 'Validação', detail: 'Informe o título e a data do lembrete.', life: 4000 }); if (form.value.recurrence_rule !== 'none' && !form.value.recurrence_until) return toast.add({ severity: 'warn', summary: 'Validação', detail: 'Informe até quando a recorrência deve se repetir.', life: 4000 }); const payload = { ...form.value, starts_at: new Date(form.value.starts_at).toISOString(), ends_at: form.value.ends_at ? new Date(form.value.ends_at).toISOString() : null, recurrence_until: form.value.recurrence_rule === 'none' ? null : form.value.recurrence_until, service_id: form.value.service_id || null, sale_id: form.value.sale_id || null }; loading.value = true; try { if (editingId.value) await Axios.put(`${API_CONFIG.AGENDA}/${editingId.value}`, payload); else await Axios.post(API_CONFIG.AGENDA, payload); dialog.value = false; await load(); toast.add({ severity: 'success', summary: 'Agenda', detail: 'Lembrete salvo com sucesso.', life: 4000 }); } catch (error) { toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.msg || 'Erro ao salvar lembrete.', life: 5000 }); } finally { loading.value = false; } };
const remove = (event, task) => confirm.require({ target: event.currentTarget, message: `Remover o lembrete "${task.title}"?`, icon: 'pi pi-exclamation-triangle', acceptLabel: 'Sim', rejectLabel: 'Não', accept: async () => { await Axios.delete(`${API_CONFIG.AGENDA}/${task.id}`); await load(); } });
const toggleDone = async (task) => { await Axios.put(`${API_CONFIG.AGENDA}/${task.id}`, { title: task.title, description: task.description, starts_at: new Date(task.starts_at).toISOString(), ends_at: task.ends_at, color: task.color || '#3B82F6', completed: !task.completed, service_id: task.service_id, sale_id: task.sale_id, recurrence_rule: task.recurrence_rule || 'none', recurrence_until: task.recurrence_until || null }); await load(); };
const shiftMonth = (amount) => { cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + amount, 1); load(); };
onMounted(load);
</script>
<template>
    <ConfirmPopup /><Toast />
    <div class="card agenda-card">
        <div class="flex align-items-center justify-content-between gap-3 mb-4 flex-wrap"><div class="page-title-row"><h2 class="page-title mb-0">Agenda</h2><i class="pi pi-info-circle page-title-info" v-tooltip.top="'Crie lembretes e vincule-os opcionalmente a serviços ou vendas.'" /></div><div class="flex gap-2"><Button icon="pi pi-chevron-left" text @click="shiftMonth(-1)" /><span class="agenda-month">{{ monthLabel }}</span><Button icon="pi pi-chevron-right" text @click="shiftMonth(1)" /><Button label="Novo lembrete" icon="pi pi-plus" @click="openNew()" /></div></div>
        <div class="agenda-weekdays"><span v-for="day in ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']" :key="day">{{ day }}</span></div>
        <div class="agenda-grid" :class="{ 'opacity-60': loading }"><button v-for="cell in days" :key="cell.key" type="button" class="agenda-day" :class="{ 'agenda-day-muted': !cell.current }" @click="openNew(cell.date)"><span class="agenda-day-number">{{ cell.date.getDate() }}</span><span v-for="task in tasksFor(cell.key).slice(0, 3)" :key="task.id" class="agenda-task" :class="{ 'agenda-task-done': task.completed }" :style="{ borderLeftColor: task.color || '#3B82F6' }" @click.stop="openEdit(task)"><i class="pi pi-bell mr-1" />{{ task.title }}</span><small v-if="tasksFor(cell.key).length > 3" class="text-500">+{{ tasksFor(cell.key).length - 3 }} lembrete(s)</small></button></div>
    </div>
    <Dialog v-model:visible="dialog" modal :style="{ width: 'clamp(22rem, 52vw, 48rem)' }" :header="editingId ? 'Editar lembrete' : 'Novo lembrete'"><div class="grid p-fluid mt-3"><div class="field col-12"><span class="p-float-label"><InputText id="agendaTitle" v-model="form.title" /><label for="agendaTitle"><span class="text-red-500">*</span> Título</label></span></div><div class="field col-12 md:col-6"><span class="p-float-label"><InputText id="agendaStarts" type="datetime-local" placeholder=" " v-model="form.starts_at" /><label for="agendaStarts"><span class="text-red-500">*</span> Data e hora</label></span></div><div class="field col-12 md:col-6"><span class="p-float-label"><InputText id="agendaEnds" type="datetime-local" placeholder=" " v-model="form.ends_at" /><label for="agendaEnds">Fim (opcional)</label></span></div><div class="field col-12 md:col-6"><span class="p-float-label"><Dropdown inputId="agendaRecurrence" v-model="form.recurrence_rule" :options="[{ label: 'Não repetir', value: 'none' }, { label: 'Todos os dias', value: 'daily' }, { label: 'Toda semana', value: 'weekly' }, { label: 'Todo mês', value: 'monthly' }]" optionLabel="label" optionValue="value" class="w-full agenda-select" /><label for="agendaRecurrence">Recorrência</label></span></div><div v-if="form.recurrence_rule !== 'none'" class="field col-12 md:col-6"><span class="p-float-label"><InputText id="agendaRecurrenceUntil" type="date" placeholder=" " v-model="form.recurrence_until" /><label for="agendaRecurrenceUntil">Repetir até</label></span></div><div class="field col-12 md:col-6"><div class="flex flex-column align-items-start"><label for="agendaColor" class="block text-600 text-sm mb-1">Cor</label><ColorPicker v-model="form.color" id="agendaColor" format="hex" class="basic-data-color-picker" /></div></div><div class="field col-12"><span class="p-float-label"><Textarea id="agendaDescription" v-model="form.description" rows="3" /><label for="agendaDescription">Descrição</label></span></div><div class="field col-12 md:col-6"><span class="p-float-label"><Dropdown inputId="agendaService" v-model="form.service_id" :options="services" optionLabel="client" optionValue="id" filter showClear class="w-full agenda-select"><template #option="{ option }">OS {{ option.order_of_service }} - {{ option.client }}</template><template #value="{ value }">{{ services.find((item) => item.id === value)?.client || '' }}</template></Dropdown><label for="agendaService">Vincular serviço (opcional)</label></span></div><div class="field col-12 md:col-6"><span class="p-float-label"><Dropdown inputId="agendaSale" v-model="form.sale_id" :options="sales" optionLabel="customer_name" optionValue="id" filter showClear class="w-full agenda-select" /><label for="agendaSale">Vincular venda (opcional)</label></span></div></div><template #footer><Button v-if="editingId" label="Excluir" icon="pi pi-trash" severity="danger" text @click="remove($event, { id: editingId, title: form.title }); dialog = false" /><Button label="Cancelar" text @click="dialog = false" /><Button label="Salvar" icon="pi pi-check" :loading="loading" @click="save" /></template></Dialog>
</template>
<style scoped>
.agenda-month { min-width: 10rem; text-align: center; text-transform: capitalize; font-weight: 600; color: var(--text-color); }
.agenda-weekdays, .agenda-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.agenda-weekdays { color: var(--text-color-secondary); font-weight: 600; text-align: center; margin-bottom: .5rem; }
.agenda-day { min-height: 7rem; border: 1px solid var(--surface-border); background: var(--surface-card); text-align: left; padding: .5rem; cursor: pointer; color: var(--text-color); transition: background .15s; }
.agenda-day:hover { background: var(--surface-hover); }
.agenda-day-muted { background: var(--surface-ground); color: var(--text-color-secondary); }
.agenda-day-number { display: block; font-weight: 600; margin-bottom: .35rem; }
.agenda-task { display: block; background: var(--primary-100); color: var(--primary-700); border-radius: 4px; padding: .2rem .3rem; margin-top: .2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .75rem; }
.agenda-task-done { text-decoration: line-through; opacity: .65; }
.agenda-select { min-height: 2.75rem; }
.agenda-color { width: 3rem; height: 2.75rem; border: 1px solid var(--surface-border); border-radius: 6px; padding: .2rem; background: var(--surface-card); cursor: pointer; }
@media (max-width: 768px) { .agenda-day { min-height: 5rem; padding: .25rem; } .agenda-task { font-size: .65rem; } }
</style>
