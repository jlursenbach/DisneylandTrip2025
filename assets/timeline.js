/* timeline.js – renders both List and Frappe-Gantt view */
const dataURL   = '../data/schedule.json';
const listView  = document.getElementById('listView');
const ganttBox  = document.getElementById('gantt');
const toggleBtn = document.getElementById('toggleBtn');

let gantt;                // Frappe Gantt instance
let events=[];

/* ------------- fetch JSON & build initial list ------------ */
fetch(dataURL).then(r=>r.json()).then(json=>{
  events = json;
  buildList();
});

function buildList(){
  listView.innerHTML='';
  events.forEach(ev=>{
    const div=document.createElement('div');
    div.className='event-item';
    div.innerHTML = `
        <strong>${timeStr(ev.start)}-${timeStr(ev.end)}</strong><br>
        ${ev.title}`;
    div.onclick = ()=>showNote(ev);
    listView.appendChild(div);
  });
}

function buildGantt(){
  if(gantt){gantt.refresh(events);return;}
  gantt = new Gantt('#ganttSvg', events, {
    view_mode:'Quarter Day',
    on_click: showNote
  });
}

function showNote(ev){
  const msg = ev.note || '(no note)';
  alert(`${ev.title}\n${timeStr(ev.start)}-${timeStr(ev.end)}\n\n${msg}`);
}

function timeStr(iso){
  return new Date(iso).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}

/* ------------- view toggle ------------- */
toggleBtn.onclick = ()=>{
  const listOpen = listView.style.display!=='none';
  if(listOpen){
    listView.style.display='none';
    ganttBox.style.display='block';
    buildGantt();
    toggleBtn.textContent='Switch to List View';
  }else{
    listView.style.display='flex';
    ganttBox.style.display='none';
    toggleBtn.textContent='Switch to Gantt View';
  }
};
