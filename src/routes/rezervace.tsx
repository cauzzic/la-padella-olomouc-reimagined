import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { PageIntro } from '@/components/restaurant/common';
import { pageHead } from '@/data/restaurant';

const EID = 'hydra-1307d44f-b1e7-429d-8e85-504d43b9c539';
const TAG = `hors-${EID}`;
const SCRIPT_ID = 'dish-reservation-widget';

export const Route=createFileRoute('/rezervace')({head:()=>pageHead('Rezervace stolu','Rezervujte si stůl v La Padella Olomouc online přes rezervační systém DISH.'),component:Reservations});

function DishWidget(){
  useEffect(()=>{
    const el=document.getElementById(TAG);
    if(!el||el.querySelector('iframe')) return;
    (window as unknown as {_hors:string[][]})._hors=[
      ['eid',EID],['tagid',TAG],['width','100%'],['height','560'],
      ['foregroundColor','#1F332B'],['backgroundColor','#FBFAF6'],['linkColor','#B23A2A'],['errorColor','#B23A2A'],
      ['primaryButtonForegroundColor','#FFFFFF'],['primaryButtonBackgroundColor','#B23A2A'],
      ['secondaryButtonForegroundColor','#FFFFFF'],['secondaryButtonBackgroundColor','#1E362C'],
    ];
    document.getElementById(SCRIPT_ID)?.remove();
    const s=document.createElement('script');s.id=SCRIPT_ID;s.src='https://reservation.dish.co/widget.js';s.async=true;
    document.body.appendChild(s);
  },[]);
  return <div id={TAG} className="w-full max-w-full overflow-hidden [&_iframe]:block [&_iframe]:w-full [&_iframe]:max-w-full" style={{minHeight:560}}/>;
}

function Reservations(){return <><PageIntro eyebrow="Un tavolo per voi" title="Váš stůl už čeká." description="Ve dvou, s rodinou nebo s přáteli. Naplánujte si chvíli, která bude chutnat po Itálii."/><section className="section"><div className="wrap reservation-grid"><div className="min-w-0"><h2 className="display text-4xl mb-6">Dáme si<br/>spolu něco dobrého?</h2><p className="body-copy">Vyberte si den, čas a počet hostů. Rezervace se odešle přímo do rezervačního systému restaurace a potvrzení obdržíte e-mailem.</p><p className="notice">Pro větší skupiny nebo zvláštní příležitosti nás prosím kontaktujte telefonicky.</p></div><div className="min-w-0"><DishWidget/></div></div></section></>}
