export default function Modal({title,onClose,children}:any){
  return <div className="modalBg" onClick={onClose}>
    <div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modalHead"><h2>{title}</h2><button className="iconBtn" onClick={onClose}>×</button></div>
      {children}
    </div>
  </div>;
}
