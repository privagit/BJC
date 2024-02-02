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
  let doc = {
    info: {
      title: `QR_${PlanNo}`,
      creator: "PRIVA INNOTECH CO., LTD",
    },
    pageMargins: [0, 0, 0, 0],
    pageSize: {
      width: 595.35,
      height: 841.995,
    },
    content: [
      {
        layout: "QrCard",
        // layout: "QrCardnoBorder",
        table: {
          headerRows: 0,
          widths: ["20%", "*", "*"],
          body: data,
          // [
          //   [
          //     {
          //       text: "",
          //     },
          //     {
          //       stack: [
          //         {
          //           text: "บริษัท มงคลสมัย จำกัด\n149 ม.5 ต.ผาจุก อ.เมือง จ.อุตรดิตถ์ 53500\nโทร 0-5544-9126-7",
          //           alignment: "right",
          //           fontSize: 6,
          //         },
          //       ],
          //     },
          //   ],
          // ],
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

const cardTemplate = (plan, card) => {
  const { Customer, Shipper, DriverName, VehiclePlate, TrailerPlate, WeightType } = plan;
  const { CardId, Product } = card;
  // const numberWithPadding = String(CardId).padStart(10, "0");
  const qrCode = `#${CardId}`;
  const columns_width = "40%";
  return [
    {
      stack: [
        {
          qr: qrCode,
          eccLevel: "H",
          version: 2,
          fit: 100,
          alignment: "right",
        },
      ],
    },
    {
      stack: [
        {
          columns: [
            {
              width: "35%",
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
              width: "35%",
              text: `พนักงานขับรถ:`,
              style: "btext",
            },
            {
              width: "*",
              text: `${DriverName || "-"}`,
            },
          ],
        },
        {
          columns: [
            {
              width: "35%",
              text: `ทะเบียนรถ:`,
              style: "btext",
            },
            {
              width: "*",
              text: `${VehiclePlate}`,
            },
          ],
        },
        {
          columns: [
            {
              width: "35%",
              text: `บริษัทขนส่ง:`,
              style: "btext",
            },
            {
              width: "*",
              text: `${Shipper}`,
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
              width: "35%",
              text: `ประเภทการชั่ง:`,
              style: "btext",
            },
            {
              width: "*",
              text: `${WeightType == 1 ? "ชั่งเข้า" : "ชั่งออก"}`,
            },
          ],
        },
        {
          columns: [
            {
              width: "35%",
              text: `สินค้า:`,
              style: "btext",
            },
            {
              width: "*",
              text: `${Product}`,
            },
          ],
        },
        {
          columns: [
            {
              width: "35%",
              text: `ทะเบียนพ่วง:`,
              style: "btext",
            },
            {
              width: "*",
              text: `${TrailerPlate || "-"}`,
            },
          ],
        },
        {
          columns: [
            {
              width: "35%",
              text: `บริษัท:`,
              style: "btext",
            },
            {
              width: "*",
              text: `${Customer}`,
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
