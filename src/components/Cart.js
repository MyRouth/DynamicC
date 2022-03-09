import React from 'react';
import BackIcon from '@material-ui/icons/ArrowBack';
import DeleteIcon from '@material-ui/icons/Delete';
import Warning from '@material-ui/icons/Warning';

import './Cart.css';

function Cart({ setRenderCompo, cartsElement, setCartsElement }) {
    let renderElement;

    const remove = (itemKey) => {
        const items = [...cartsElement];
        items.splice(items.findIndex(({ key }) => key === itemKey), 1);
        setCartsElement(items);
    }
    if (cartsElement.length) {
        renderElement = cartsElement?.map((element, i) => (
            <div className='cart' key={element.key}>
                <div className='item-number'>Item Number: {element.itemNumber}</div>
                <div className='sub-element'>Shop Rate: {element.shopRate}</div>
                <div className='sub-element cost'>Cost: $ {element.cost}</div>
                <button title="Remove" className='item-remove' onClick={() => remove(element.key)} >
                    <DeleteIcon />
                </button>
            </div>
        ))
    } else {
        renderElement = <div className='cn'><Warning style={{ transform: 'scale(3)' }} /> Cart is Empty</div>;
    }
    return (
        <>
            <div className='cart-heading'>
                <button title="Back" className='back-btn' onClick={() => setRenderCompo('default')}>
                    <BackIcon tilte='Back' style={{ transform: 'scale(1.6)' }} />
                </button>
                <span className='cart-title'>Cart</span>
            </div>
            {renderElement}
        </>
    )
}

export default Cart;
