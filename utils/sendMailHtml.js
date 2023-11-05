const formatCurrency = (number) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const formattedNumber = formatter.format(number);

  return formattedNumber.replace(/VND/g, "đ");
};

const sendMailHtml = (order) => {
  return `<div style="width: 100%; height: 100%; overflow: auto;">
  <div>
    <p style="font-size: 32px; font-weight: 550;">Hello ${
      order.user.fullName
    }</p>
    <p>Phone: ${order.user.phoneNumber}</p>
    <p>Address: ${order.address}</p>
    <table>
      <thead>
        <tr>
          <th>PRODUCT</th>
          <th>IMAGE</th>
          <th>PRICE</th>
          <th>QUANTITY</th>
          <th>MONEY</th>
        </tr>
      </thead>
      <tbody>
        ${order.cart.items.map(
          (item) => `<tr>
          <td>${item.product.name}</td>
          <td>
            <img src="${
              item.product.img1
            }" alt="Product Image" style="height: 200pxpx;"/>
          </td>
          <td>${formatCurrency(item.product.price)}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.product.price * item.quantity)}</td>
          </tr>`
        )}
      </tbody>
    </table>
    <p style="font-size: 32px;">Total price :</p>
    <p style="font-size: 32px;">${formatCurrency(order.cart.totalPrice)}</p>
    <p style="font-size: 32px;">Thank You !!</p>
  </div>
</div>`;
};

module.exports = sendMailHtml;
