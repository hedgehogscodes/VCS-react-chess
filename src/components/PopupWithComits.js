import React from "react";

function PopupWithComits({ isOpen, onClose, commits, onCheckout}) {

  return (
    <div className={`popup ${isOpen && "popup_opened"}`} >
      <div className="popup__container">
        <button type="button" className="popup__btn popup__btn_action_close" onClick={onClose} ></button>
        <h2 className="popup__title">Выберите сохранение</h2>
        {commits.map((comit, index) => (
          <button onClick={() => { onCheckout(index) }} key={index} value={index} className="popup__btn popup__btn_action_save">Сохранение № {index+1}</button>
        ))}
      </div>
    </div>

  );
}

export default PopupWithComits;