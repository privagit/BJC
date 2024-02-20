const fonts = {
  Tahoma: {
    normal: "assets/fonts/tahoma/tahoma.ttf",
    bold: "assets/fonts/tahoma/tahoma-bd.ttf",
    italics: "assets/fonts/tahoma/tahoma-it.ttf",
    bolditalics: "assets/fonts/tahoma/tahoma-bfi.ttf",
  },
};

const Layout = {
  QrCard: {
    hLineWidth: function (i, node) {
      // if (i === 0 && i === 3) {
      //   return 1;
      // }
      return 1;
    },
    vLineWidth: function (i, node) {
      if (i === 0 && i === 3) {
        return 1;
      }
      return 0;
    },
    hLineColor: function (i) {
      return "#000";
    },
    paddingLeft: function (i) {
      return 10;
    },
    paddingRight: function (i) {
      return 10;
    },
    paddingTop: function (i) {
      return 10;
    },
    paddingBottom: function (i) {
      return 10;
    },
  },
  QrCardnoBorder: {
    hLineWidth: function (i) {
      return 0;
    },
    vLineWidth: function (i) {
      return 0;
    },
    hLineColor: function (i) {
      return "#000";
    },
    paddingLeft: function (i) {
      return 10;
    },
    paddingRight: function (i) {
      return 10;
    },
    paddingTop: function (i) {
      return 10;
    },
    paddingBottom: function (i) {
      return 10;
    },
  },
};

const createQrCard = async (plan, cards) => {
  let { PlanNo } = plan;
  let data = cards.map((card) => cardTemplate(plan, card));
  let Head = [cardHeadTemplate(plan)];
  // data.splice(0, 0, cardHeadTemplate(plan));
  let doc = {
    info: {
      title: `QR_${PlanNo}`,
      creator: "PRIVA INNOTECH CO., LTD",
    },
    pageMargins: [0, 0, 0, 0],
    pageSize: {
      // width: 226.8,
      width: 210,
      // height: 490,
      height: "auto",
    },
    content: [
      {
        layout: "QrCard",
        // layout: "QrCardnoBorder",
        table: {
          headerRows: 0,
          widths: ["30%", "*"],
          body: Head,
        },
      },
      {
        layout: "QrCard",
        table: {
          headerRows: 0,
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  {
                    columns: [
                      {
                        width: "*",
                        text: `โปรดตรวจสอบสินค้า
                        ก่อนสแกนทุกครั้ง`,
                        style: "btext",
                        margin: [0, 0, 0, 0],
                        alignment: "center",
                        fontSize: 13,
                      },
                    ],
                  },
                ],
              },
            ],
          ],
        },
      },
      {
        layout: "QrCard",
        // layout: "QrCardnoBorder",
        table: {
          headerRows: 0,
          widths: ["30%", "*"],
          body: data,
        },
      },
    ],
    styles: {
      btext: { bold: true },
    },
    defaultStyle: {
      font: "Tahoma",
      fontSize: 10,
      lineHeight: 1.4,
    },
  };
  return doc;
};

const cardHeadTemplate = (plan) => {
  const { Customer, Shipper, DriverName, VehiclePlate, TrailerPlate, WeightType } = plan;
  return [
    {
      stack: [
        {
          columns: [
            {
              width: "*",
              text: `บริษัท:`,
              style: "btext",
            },
          ],
        },

        {
          columns: [
            {
              width: "*",
              text: `บริษัทขนส่ง:`,
              style: "btext",
            },
          ],
        },
        {
          columns: [
            {
              width: "*",
              text: `พนักงานขับรถ:`,
              style: "btext",
            },
          ],
        },
        {
          columns: [
            {
              width: "*",
              text: `ทะเบียนรถ:`,
              style: "btext",
            },
          ],
        },
        {
          columns: [
            {
              width: "*",
              text: `ทะเบียนพ่วง:`,
              style: "btext",
            },
          ],
        },
        {
          columns: [
            {
              width: "*",
              text: `ประเภทการชั่ง:`,
              style: "btext",
            },
          ],
        },
      ],
    },
    {
      stack: [
        {
          columns: [
            {
              width: "*",
              text: `${Customer || "-"}`,
            },
          ],
        },
        {
          columns: [
            {
              width: "*",
              text: `${Shipper || "-"}`,
            },
          ],
        },
        {
          columns: [
            {
              width: "*",
              text: `${DriverName || "-"}`,
            },
          ],
        },
        {
          columns: [
            {
              width: "*",
              text: `${VehiclePlate || "-"}`,
            },
          ],
        },
        {
          columns: [
            {
              width: "*",
              text: `${TrailerPlate || "-"}`,
            },
          ],
        },
        {
          columns: [
            {
              width: "*",
              text: `${WeightType == 1 ? "ชั่งเข้า" : "ชั่งออก"}`,
            },
          ],
        },
      ],
    },
  ];
};

const cardTemplate = (plan, card) => {
  const { CardId, Product } = card;
  const qrCode = `#${CardId}`;
  return [
    {
      stack: [
        {
          qr: qrCode,
          eccLevel: "H",
          version: 2,
          fit: 65,
          alignment: "right",
        },
      ],
    },
    {
      stack: [
        {
          columns: [
            {
              width: "40%",
              text: `Card ID:`,
              style: "btext",
            },
            {
              width: "*",
              text: `${qrCode}`,
            },
          ],
        },
        {
          columns: [
            {
              width: "40%",
              text: `สินค้า :`,
              style: "btext",
            },
          ],
        },
        {
          columns: [
            {
              width: "*",
              text: `${Product || "-"}`,
            },
          ],
        },
      ],
    },
  ];
};

module.exports = {
  fonts,
  Layout,
  createQrCard,
};
