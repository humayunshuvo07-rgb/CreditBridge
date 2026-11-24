/* Filterable university suggestions with editable free-text entry. */
(() => {
  'use strict';
  const input = document.getElementById('universityName');
  const list = document.getElementById('universityResults');
  if (!input || !list) return;
  const universities = [
    'Technische Hochschule Deggendorf (THD)',
    'Deggendorf Institute of Technology (THD)',
    'Technische Universität Berlin (TU Berlin)',
    'Karlsruhe Institute of Technology (KIT)',
    'University of Twente',
    'Delft University of Technology (TU Delft)',
    'Politecnico di Milano'
  ];
  input.setAttribute('aria-controls', 'universityResults');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  const hide = () => {list.hidden = true;input.setAttribute('aria-expanded','false');};
  function render() {
    const query=input.value.trim().toLocaleLowerCase();
    const matches=universities.filter(name=>name.toLocaleLowerCase().includes(query));
    list.replaceChildren();
    if(matches.length){
      matches.forEach(name=>{
        const button=document.createElement('button');
        button.type='button';button.className='university-option';
        button.setAttribute('role','option');button.textContent=name;
        button.addEventListener('click',()=>{
          input.value=name;input.dispatchEvent(new Event('input',{bubbles:true}));hide();input.focus();
        });
        list.appendChild(button);
      });
    } else {
      const note=document.createElement('p');note.className='university-empty';
      note.textContent='No matching suggestion. You can enter your university manually.';
      list.appendChild(note);
    }
    list.hidden=false;input.setAttribute('aria-expanded','true');
  }
  input.addEventListener('focus',render);
  input.addEventListener('input',render);
  input.addEventListener('keydown',event=>{
    if(event.key==='Escape')hide();
    if(event.key==='ArrowDown'&&!list.hidden){
      const first=list.querySelector('button');if(first){event.preventDefault();first.focus();}
    }
  });
  document.addEventListener('pointerdown',event=>{if(!list.contains(event.target)&&event.target!==input)hide();});
  document.getElementById('universityStepForm')?.addEventListener('submit',hide);
})();
