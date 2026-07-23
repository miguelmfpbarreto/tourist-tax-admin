"use client";
import { Edit3, LoaderCircle, Plus, Power, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AdminDefinition } from "@/lib/adminEntities";
import type { AdminRow } from "@/types";

function value(row:AdminRow,key:string){
 if(key==="is_active") return row.is_active?"ATIVO":"INATIVO";
 if(key==="full_name") return `${row.name||""} ${row.sur_name||""}`.trim();
 if(key==="permissions_count") return Array.isArray(row.permission_ids)?row.permission_ids.length:(row.permissions_count||0);
 return String(row[key]??"—");
}
function initial(def:AdminDefinition){const o:Record<string,unknown>={}; def.fields.forEach(f=>o[f.name]=""); return o;}
function normalize(def:AdminDefinition, form:Record<string,unknown>){
 const out={...form};
 if(def.entity==="users" && out.profile_id!=="") out.profile_id=Number(out.profile_id);
 if(def.entity==="profiles") out.permission_ids=String(out.permission_ids||"").split(",").map(v=>Number(v.trim())).filter(Number.isFinite);
 if(def.entity==="users" && !out.password) delete out.password;
 return out;
}
export function AdminCrud({definition}:{definition:AdminDefinition}){
 const [rows,setRows]=useState<AdminRow[]>([]),[search,setSearch]=useState(""),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[modal,setModal]=useState(false),[editing,setEditing]=useState<AdminRow|null>(null),[form,setForm]=useState<Record<string,unknown>>(initial(definition)),[error,setError]=useState(""),[message,setMessage]=useState("");
 const load=useCallback(async()=>{setLoading(true);setError("");try{const q=new URLSearchParams({page:"1",limit:"200"});if(search.trim())q.set("search",search.trim());const r=await fetch(`/api/administration/${definition.entity}?${q}`);const j=await r.json();if(!r.ok||!j.success){setError(j.message||"Erro ao carregar.");return;}const p=j.data;setRows(Array.isArray(p)?p:(p.data||[]));}catch{setError("Falha de comunicação.");}finally{setLoading(false);}},[definition.entity,search]);
 useEffect(()=>{load();},[load]);
 function create(){setEditing(null);setForm(initial(definition));setModal(true);}
 function edit(row:AdminRow){const f=initial(definition);definition.fields.forEach(x=>{let v=row[x.name]??"";if(x.name==="permission_ids"&&Array.isArray(v))v=v.join(",");f[x.name]=v;});setEditing(row);setForm(f);setModal(true);}
 async function save(e:React.FormEvent){e.preventDefault();setSaving(true);setError("");const url=editing?`/api/administration/${definition.entity}/${editing.uuid}`:`/api/administration/${definition.entity}`;const r=await fetch(url,{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(normalize(definition,form))});const j=await r.json();setSaving(false);if(!r.ok||!j.success){setError(j.message||"Erro ao guardar.");return;}setModal(false);setMessage(`${definition.singular} guardado com sucesso.`);await load();}
 async function toggle(row:AdminRow){const active=!row.is_active;if(!confirm(`Deseja ${active?"ativar":"desativar"} este registo?`))return;const r=await fetch(`/api/administration/${definition.entity}/${row.uuid}/status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({is_active:active})});const j=await r.json();if(!r.ok||!j.success){setError(j.message||"Erro ao alterar estado.");return;}await load();}
 return <>
  <section className="card admin-toolbar"><form onSubmit={e=>{e.preventDefault();load();}}><div className="admin-search"><Search size={17}/><input className="input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar..."/></div><button className="btn">Pesquisar</button></form><button className="btn" onClick={create}><Plus size={17}/>Novo</button></section>
  {error&&<div className="report-alert error">{error}</div>}{message&&<div className="report-alert success">{message}</div>}
  <section className="card">{loading?<div className="admin-loading"><LoaderCircle className="spin"/>A carregar...</div>:<div className="table-wrap"><table className="table"><thead><tr>{definition.columns.map(c=><th key={c.key}>{c.label}</th>)}<th>Ações</th></tr></thead><tbody>{rows.map((row,i)=><tr key={String(row.uuid||i)}>{definition.columns.map(c=><td key={c.key}>{c.key==="is_active"?<span className={`badge ${row.is_active?"success":"danger"}`}>{value(row,c.key)}</span>:value(row,c.key)}</td>)}<td><div className="admin-row-actions"><button className="icon-btn" onClick={()=>edit(row)}><Edit3 size={16}/></button><button className={`icon-btn ${row.is_active?"danger":"success"}`} onClick={()=>toggle(row)}><Power size={16}/></button></div></td></tr>)}</tbody></table>{rows.length===0&&<div className="empty">Nenhum registo encontrado.</div>}</div>}</section>
  {modal&&<div className="admin-modal-overlay"><section className="card admin-modal"><header className="admin-modal-header"><h2>{editing?"Editar":"Novo"} {definition.singular}</h2><button className="icon-btn" onClick={()=>setModal(false)}><X size={18}/></button></header><form onSubmit={save}><div className="admin-form-grid">{definition.fields.map(f=><label key={f.name} className="report-field"><span>{f.label}{f.required?" *":""}</span>{f.type==="textarea"?<textarea className="input admin-textarea" value={String(form[f.name]??"")} onChange={e=>setForm({...form,[f.name]:e.target.value})}/>:<input className="input" type={f.type} value={String(form[f.name]??"")} required={f.required && !(editing&&f.name==="password")} onChange={e=>setForm({...form,[f.name]:e.target.value})}/>}</label>)}</div><footer className="admin-modal-footer"><button type="button" className="btn secondary" onClick={()=>setModal(false)}>Cancelar</button><button className="btn" disabled={saving}>{saving?"A guardar...":"Guardar"}</button></footer></form></section></div>}
 </>;
}
