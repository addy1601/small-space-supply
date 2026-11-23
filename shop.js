const products = {
  standard: { name: 'RÅSKOG', size: 'Standard cart', width: '17¾″', depth: '13¾″', height: '30⅜″', cents: 3999, finishes: ['black', 'white', 'red'], description: 'Three steel trays and lockable wheels for a kitchen or desk.' },
  compact: { name: 'RÅSKOG', size: 'Compact cart', width: '15″', depth: '11″', height: '24″', cents: 2999, finishes: ['small'], description: 'Three steel trays in a lower profile that fits under many worktops.' },
  wide: { name: 'NISSAFORS', size: 'Wide cart', width: '19⅞″', depth: '11¾″', height: '32⅝″', cents: 2999, finishes: ['wide'], description: 'Three steel trays with extra room across the long side.' },
};
const finishes = {
  black: ['Black', '#303532'], white: ['White', '#fafbf7'], red: ['Red-brown', '#9e4b37'],
  small: ['Gray-green', '#738279'], wide: ['Black', '#303532'],
};
const methods = {
  pickup: { title: 'Tempe store pickup', detail: 'Tomorrow, 12–6 PM · Tempe, AZ', fee: 200 },
  delivery: { title: 'Home delivery', detail: 'In 3–5 days · sample Tempe address', fee: 999 },
};
const target = document.querySelector('#shop');
const dialog = document.querySelector('#reset-dialog');
const currency = new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'});
const money = cents => currency.format(cents / 100);
const initial = () => ({screen:1, bag:null, method:'pickup', draft:null, returnTo:1, checked:false});
let state = initial();
const button = (label, action, style='primary', value='') =>
  `<button type="button" class="${style}" data-action="${action}" data-value="${value}">${label}</button>`;
const img = (finish, name) => `<div class="photo"><img src="img/${finish}.jpg" alt="${finishes[finish][0]} ${name} rolling cart"></div>`;
const totalFor = (product, method) => {
  const subtotal = product.cents;
  const fee = methods[method].fee;
  const tax = Math.round(subtotal * .08);
  return {subtotal, fee, tax, total:subtotal+fee+tax};
};
function dimensions(product) {
  return `<dl class="dims">${[['Width',product.width],['Depth',product.depth],['Height',product.height]].map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
}
function heading(title, copy) {
  return `<h1 tabindex="-1">${title}</h1><p class="lead">${copy}</p>`;
}
function steps() {
  const current = [0,1,1,2,3,3,4,5][state.screen];
  return `<ol class="steps" aria-label="Checkout progress">${['Explore','Bag','Fulfillment','Review','Done'].map((step,i)=>`<li ${current===i+1?'aria-current="step"':''}><span aria-hidden="true">${i+1}</span>${step}</li>`).join('')}</ol>`;
}
function catalog() {
  return heading('Rolling storage carts','Compare the width, depth, and height before choosing a cart.')+
    `<div class="grid">${Object.entries(products).map(([id,p])=>`<article class="card">${img(p.finishes[0],p.name)}<div class="card-body"><div class="row"><h2>${p.name}</h2><strong>${money(p.cents)}</strong></div><p class="tag">${p.size}</p>${dimensions(p)}${button('View '+p.size.toLowerCase(),'view','secondary',id)}</div></article>`).join('')}</div>`;
}
function detail() {
  const p=products[state.draft.id];
  return heading(p.name,p.size)+`<div class="two detail">${img(state.draft.finish,p.name)}<section class="panel"><div class="row"><h2>Product details</h2><span class="price">${money(p.cents)}</span></div><p>${p.description}</p>${dimensions(p)}<fieldset><legend>Finish</legend><div class="finishes">${p.finishes.map(f=>`<label class="choice"><input type="radio" name="finish" value="${f}" ${f===state.draft.finish?'checked':''}><span><i class="dot" aria-hidden="true" style="background:${finishes[f][1]}"></i>${finishes[f][0]}</span></label>`).join('')}</div></fieldset><p class="note">Pickup availability is checked when you choose fulfillment.</p><div class="actions">${button(state.returnTo===1?'Add to bag':'Save selection','save')}${button(state.returnTo===1?'Back to carts':'Cancel changes','cancel','link')}</div></section></div>`;
}
function item(edit=false) {
  const {id,finish}=state.bag;
  const p=products[id];
  return `<section class="panel lineitem">${img(finish,p.name)}<div class="copy"><h2>${p.name} <span class="tag">· ${p.size}</span></h2><p>${finishes[finish][0]} · Quantity 1</p><p>${p.width} wide × ${p.depth} deep × ${p.height} high</p>${edit?button('Change finish','edit','link'):''}</div><strong>${money(p.cents)}</strong></section>`;
}
function costs(label='',action='',estimate=false) {
  const p=products[state.bag.id];
  const {subtotal,fee,tax,total}=totalFor(p,state.method);
  return `<aside class="cost"><h2>${estimate?'Cost estimate':'Order total'}</h2><dl><div><dt>Item subtotal</dt><dd>${money(subtotal)}</dd></div><div><dt>${state.method==='pickup'?'Tempe pickup':'Home delivery'}</dt><dd>${money(fee)}</dd></div><div><dt>Tax</dt><dd>${money(tax)}</dd></div><div class="total"><dt>${estimate?'Estimated total':'Total'}</dt><dd>${money(total)}</dd></div></dl>${estimate?'<p class="note">Availability and fulfillment are confirmed before order review.</p>':''}${label?button(label,action):''}</aside>`;
}
function bag() {
  return heading('Your bag','Review your cart and finish before choosing pickup or delivery.')+`<div class="two"><div>${item(true)}<div class="actions">${button('Back to carts','browse','link')}</div></div>${costs('Choose pickup or delivery','fulfill',true)}</div>`;
}
function fulfillment() {
  return heading('Pickup or delivery','Choose how you want to receive your cart.')+
    `<div class="two"><div>${item()}<fieldset><legend>Fulfillment method</legend>${Object.entries(methods).map(([key,m])=>`<label class="choice option"><input type="radio" name="method" value="${key}" ${state.method===key?'checked':''}><span><span><strong>${m.title}</strong><small>${m.detail}</small></span><strong>${money(m.fee)}</strong></span></label>`).join('')}</fieldset><div class="actions">${button('Back to bag','bag','link')}</div></div>${costs('Check availability','check',true)}</div>`;
}
function recovery() {
  const p=products[state.bag.id];
  return heading('Pickup availability changed','Your bag still contains the original cart.')+
    `<div class="two"><div><div class="warning"><h2>Black is unavailable for Tempe pickup</h2><p>The same size is available in White or Red-brown at the same price.</p></div><section class="panel"><h2>Choose a finish available for pickup</h2><div class="actions">${p.finishes.filter(f=>f!=='black').map(f=>button('Switch to '+finishes[f][0],'replace',f==='white'?'primary':'secondary',f)).join('')}</div><div class="actions">${button('Change fulfillment','fulfill','link')} ${button('Back to bag','bag','link')}</div></section></div>${costs('','',true)}</div>`;
}
function review() {
  const method=methods[state.method];
  return heading('Review your order','Check the finish, fulfillment details, and total before confirming.')+
  `<div class="two"><div>${item(true)}<section class="panel"><div class="row"><h2>${method.title}</h2>${button('Change fulfillment','fulfill','link')}</div><p>${method.detail}</p><p>Sample customer: Jordan Reed</p></section></div>${costs('Place simulated order','place')}</div>`;
}
function complete() {
  const method=methods[state.method];
  return heading('Simulated order confirmed','Order SS-1048')+
  `<div class="two"><div><section class="success"><h2>${state.method==='pickup'?'Pickup reserved':'Delivery scheduled'}</h2><p>${method.title} · ${method.detail}</p></section>${item()}<p class="note">This is a practice order. No payment was collected and no item will be shipped or reserved.</p></div>${costs('Start a new session','restart')}</div>`;
}
const screens=[null,catalog,detail,bag,fulfillment,recovery,review,complete];
function render(focus) {
  target.dataset.state='S'+state.screen;
  target.innerHTML=steps()+screens[state.screen]();
  if(focus){
    target.querySelector('h1').focus({preventScroll:true});
    window.scrollTo(0,0);
  }
}
function go(screen) {
  state.screen=screen;
  render(true);
}
function availability() {
  const blocked=state.bag.id==='standard' && state.bag.finish==='black' && state.method==='pickup';
  state.checked=!blocked;
  go(blocked?5:6);
}
function reset() {
  state=initial();
  render(true);
}
const actions={
  reset:()=>{dialog.returnValue='';dialog.showModal();},
  restart:reset,
  browse:()=>go(1),
  view:(id)=>{
    state.draft={id,finish:state.bag?.id===id?state.bag.finish:products[id].finishes[0]};
    state.returnTo=1;
    go(2);
  },
  cancel:()=>go(state.returnTo),
  edit:()=>{
    state.returnTo=state.screen;
    state.draft={...state.bag};
    go(2);
  },
  save:()=>{
    state.bag={...state.draft};
    state.checked=false;
    if(state.returnTo===6){availability();return;}
    go(3);
  },
  bag:()=>go(3),
  fulfill:()=>go(4),
  check:availability,
  replace:finish=>{
    state.bag.finish=finish;
    availability();
  },
  place:()=>{
    if(state.checked){go(7);}
  },
};
document.addEventListener('click',event=>{
  const control=event.target.closest('[data-action]');
  if(control) actions[control.dataset.action](control.dataset.value);
});
target.addEventListener('change',event=>{
  const {name,value}=event.target;
  if(name==='finish') state.draft.finish=value;
  if(name==='method'){
    state.method=value;
    state.checked=false;
  }
  if(name==='finish'||name==='method'){
    render(false);
    target.querySelector(`input[name="${name}"]:checked`).focus();
  }
});
dialog.addEventListener('close',()=>{if(dialog.returnValue==='reset') reset();});
render(false);
