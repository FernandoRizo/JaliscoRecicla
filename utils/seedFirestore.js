// ============================================================
//  seedFirestore.js
//  JaliscoRecicla – Initial seed data for Firestore
//
//  Run once from a Node.js script using the Admin SDK:
//    npm install firebase-admin
//    node seedFirestore.js
//
//  OR call individual seed functions inside your app
//  during first-launch setup (admin only).
// ============================================================

import {
  doc, setDoc, addDoc, collection, serverTimestamp, GeoPoint
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// ─────────────────────────────────────────────────────────────
// 1.  WASTE TYPES (catalog — 6 categories)
// ─────────────────────────────────────────────────────────────
export const seedWasteTypes = async () => {
  const wasteTypes = [
    {
      id:          "wt_plastico",
      name:        "Plástico (PET)",
      category:    "plastico",
      icon:        "bottle",
      color:       "#f59e0b",
      description: "Botellas de refresco, agua, envases de yogur.",
      guidelines:  "Enjuaga el envase. Retira la etiqueta si es posible. Aplástalo para reducir volumen.",
      examples:    ["Botella PET", "Tapa plástica", "Recipiente de yogur"],
    },
    {
      id:          "wt_vidrio",
      name:        "Vidrio",
      category:    "vidrio",
      icon:        "wine-bottle",
      color:       "#8b5cf6",
      description: "Botellas de vidrio, frascos, tarros.",
      guidelines:  "Enjuaga el frasco. No mezcles con cerámica o porcelana. No quebre el vidrio.",
      examples:    ["Botella de vidrio", "Frasco de mermelada", "Tarro de conservas"],
    },
    {
      id:          "wt_papel",
      name:        "Papel y Cartón",
      category:    "papel",
      icon:        "file-text",
      color:       "#3b82f6",
      description: "Periódicos, cajas, cartón corrugado, papel de oficina.",
      guidelines:  "Mantén el papel seco. Aplana las cajas. No incluyas papel encerado o grasoso.",
      examples:    ["Periódico", "Caja de cereal", "Cartón corrugado", "Etiqueta papel"],
    },
    {
      id:          "wt_organico",
      name:        "Orgánico",
      category:    "organico",
      icon:        "leaf",
      color:       "#16a34a",
      description: "Restos de comida, cáscaras de fruta, podas de jardín.",
      guidelines:  "Separa en bolsa biodegradable. No incluyas carne ni lácteos si va a composta.",
      examples:    ["Cáscaras de fruta", "Restos de verdura", "Poda de jardín", "Café molido"],
    },
    {
      id:          "wt_electronico",
      name:        "Electrónico (RAEE)",
      category:    "electronico",
      icon:        "cpu",
      color:       "#ef4444",
      description: "Teléfonos, computadoras, cables, baterías, electrodomésticos.",
      guidelines:  "Lleva directamente al centro RAEE. Nunca tires baterías a la basura común.",
      examples:    ["Teléfono celular", "Laptop", "Cable USB", "Batería", "Foco LED"],
    },
    {
      id:          "wt_metal",
      name:        "Metal / Aluminio",
      category:    "metal",
      icon:        "layers",
      color:       "#6b7280",
      description: "Latas de aluminio, chatarra metálica, utensilios.",
      guidelines:  "Enjuaga las latas. Aplasta para reducir volumen. Separa el acero del aluminio si es posible.",
      examples:    ["Lata de refresco", "Lata de atún", "Utensilio roto", "Papel aluminio"],
    },
  ];

  for (const wt of wasteTypes) {
    const { id, ...data } = wt;
    await setDoc(doc(db, "wasteTypes", id), {
      ...data,
      createdAt: serverTimestamp(),
    });
    console.log(`✅ wasteType: ${wt.name}`);
  }
};

// ─────────────────────────────────────────────────────────────
// 2.  RECYCLING CENTERS (4 sample centers in Guadalajara)
// ─────────────────────────────────────────────────────────────
export const seedRecyclingCenters = async () => {
  const centers = [
    {
      name:      "Eco Centro GDL – Vallarta",
      address:   "Av. Vallarta 2440, Col. Arcos Vallarta, Guadalajara, Jal.",
      latitude:  20.6766,
      longitude: -103.3855,
      geohash:   "9emu4k",
      status:    "active",
      schedule:  "Lun–Vie 8:00–18:00 | Sáb 9:00–14:00",
      phone:     "+52 33 1234 5678",
      photoURL:  null,
      rating:    4.8,
      ratingCount: 127,
      wasteTypes: ["wt_plastico", "wt_vidrio", "wt_papel", "wt_organico"],
    },
    {
      name:      "PuntoVerde Zapopan – Centro",
      address:   "Av. Hidalgo 310, Centro, Zapopan, Jal.",
      latitude:  20.7197,
      longitude: -103.4040,
      geohash:   "9emuh2",
      status:    "active",
      schedule:  "Lun–Sáb 7:00–17:00",
      phone:     "+52 33 3818 0000",
      photoURL:  null,
      rating:    4.5,
      ratingCount: 89,
      wasteTypes: ["wt_plastico", "wt_papel", "wt_metal"],
    },
    {
      name:      "Centro de Reciclaje Tlaquepaque",
      address:   "Av. Niños Héroes 3051, Tlaquepaque, Jal.",
      latitude:  20.6417,
      longitude: -103.3126,
      geohash:   "9emsx4",
      status:    "active",
      schedule:  "Mar–Dom 9:00–18:00",
      phone:     "+52 33 3635 4444",
      photoURL:  null,
      rating:    4.2,
      ratingCount: 54,
      wasteTypes: ["wt_vidrio", "wt_electronico", "wt_metal"],
    },
    {
      name:      "EcoRecicla Tonalá",
      address:   "Av. Tonaltecas 140, Tonalá, Jal.",
      latitude:  20.6235,
      longitude: -103.2340,
      geohash:   "9emsu7",
      status:    "active",
      schedule:  "Lun–Vie 8:00–16:00",
      phone:     null,
      photoURL:  null,
      rating:    3.9,
      ratingCount: 31,
      wasteTypes: ["wt_organico", "wt_papel"],
    },
  ];

  for (const c of centers) {
    const { wasteTypes: wts, ...centerData } = c;
    const ref = await addDoc(collection(db, "recyclingCenters"), {
      ...centerData,
      location:  new GeoPoint(c.latitude, c.longitude),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Link waste types
    for (const wtID of wts) {
      const linkID = `${ref.id}_${wtID}`;
      await setDoc(doc(db, "centerWasteTypes", linkID), {
        centerID:    ref.id,
        wasteTypeID: wtID,
        acceptedQty: null,
        createdAt:   serverTimestamp(),
      });
    }
    console.log(`✅ recyclingCenter: ${c.name} (${wts.length} waste types linked)`);
  }
};

// ─────────────────────────────────────────────────────────────
// 3.  SAMPLE USERS  (do NOT use real passwords in seed data)
// ─────────────────────────────────────────────────────────────
export const seedUsers = async () => {
  // NOTE: In production, users are created via Firebase Auth.
  // These documents use placeholder UIDs for development only.
  const users = [
    {
      uid:      "uid_citizen_001",
      email:    "aaron@jaliscorecicla.mx",
      fullName: "Aarón Martínez López",
      phone:    "+52 33 9988 7766",
      role:     "citizen",
      photoURL: null,
      fcmToken: null,
    },
    {
      uid:      "uid_citizen_002",
      email:    "maria@jaliscorecicla.mx",
      fullName: "María García Ruiz",
      phone:    "+52 33 1122 3344",
      role:     "citizen",
      photoURL: null,
      fcmToken: null,
    },
    {
      uid:      "uid_admin_001",
      email:    "admin@jaliscorecicla.mx",
      fullName: "Oscar Flores Hernández",
      phone:    "+52 33 5566 7788",
      role:     "administrator",
      photoURL: null,
      fcmToken: null,
    },
  ];

  for (const u of users) {
    const { uid, ...data } = u;
    await setDoc(doc(db, "users", uid), {
      userID:    uid,
      ...data,
      createdAt: serverTimestamp(),
    });
    console.log(`✅ user: ${u.fullName} (${u.role})`);
  }
};

// ─────────────────────────────────────────────────────────────
// 4.  SAMPLE REPORTS
// ─────────────────────────────────────────────────────────────
export const seedReports = async () => {
  const reports = [
    {
      userID:      "uid_citizen_001",
      centerID:    null,
      name:        "Eco punto Col. Oblatos",
      address:     "Calle Río Nilo 220, Col. Oblatos, GDL",
      description: "Hay un contenedor verde en la esquina que acepta plástico y papel. Funciona todos los días.",
      wasteTypes:  ["wt_plastico", "wt_papel"],
      photoURLs:   [],
      status:      "approved",
      reviewerID:  "uid_admin_001",
      reviewNote:  "Verificado en mapa, se agrega al sistema.",
    },
    {
      userID:      "uid_citizen_002",
      centerID:    null,
      name:        "Punto Verde Plaza del Sol",
      address:     "Av. López Mateos Sur 2375, GDL",
      description: "Plaza comercial tiene contenedores de reciclaje en el estacionamiento nivel 1.",
      wasteTypes:  ["wt_plastico", "wt_metal"],
      photoURLs:   [],
      status:      "submitted",
      reviewerID:  null,
      reviewNote:  null,
    },
    {
      userID:      "uid_citizen_001",
      centerID:    null,
      name:        "Acopio EcoRecicla Tonalá mercado",
      address:     "Mercado Municipal de Tonalá, Tonalá, Jal.",
      description: "Centro de acopio de orgánicos junto al mercado, activo los fines de semana.",
      wasteTypes:  ["wt_organico"],
      photoURLs:   [],
      status:      "approved",
      reviewerID:  "uid_admin_001",
      reviewNote:  "Aprobado. Horario confirmado: sáb–dom 7:00–13:00.",
    },
  ];

  for (const r of reports) {
    await addDoc(collection(db, "reports"), {
      ...r,
      createdAt:  serverTimestamp(),
      reviewedAt: r.status === "approved" ? serverTimestamp() : null,
    });
    console.log(`✅ report: ${r.name} (${r.status})`);
  }
};

// ─────────────────────────────────────────────────────────────
// 5.  SAMPLE NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
export const seedNotifications = async () => {
  const notifications = [
    {
      userID:   "uid_citizen_001",
      title:    "¡Reporte aprobado! 🎉",
      message:  "Tu reporte 'Eco punto Col. Oblatos' fue aprobado y ya es visible en el mapa.",
      type:     "report_update",
      reportID: null,
      readAt:   null,
    },
    {
      userID:   "uid_citizen_001",
      title:    "Recolección mañana",
      message:  "Mañana a las 7:00 AM pasa el camión de orgánicos por tu colonia.",
      type:     "schedule_alert",
      reportID: null,
      readAt:   null,
    },
    {
      userID:   "uid_citizen_002",
      title:    "Tu reporte está en revisión",
      message:  "El administrador está revisando tu reporte 'Punto Verde Plaza del Sol'.",
      type:     "report_update",
      reportID: null,
      readAt:   null,
    },
    {
      userID:   "uid_citizen_001",
      title:    "Nueva campaña de reciclaje",
      message:  "Jornada de reciclaje este sábado en tu colonia. ¡Participa y gana puntos!",
      type:     "broadcast",
      reportID: null,
      readAt:   null,
    },
  ];

  for (const n of notifications) {
    await addDoc(collection(db, "notifications"), {
      ...n,
      createdAt: serverTimestamp(),
    });
    console.log(`✅ notification: ${n.title}`);
  }
};

// ─────────────────────────────────────────────────────────────
// MAIN SEED RUNNER – call this once on project setup
// ─────────────────────────────────────────────────────────────
export const runAllSeeds = async () => {
  console.log("🌱 Starting JaliscoRecicla Firestore seed...\n");
  await seedWasteTypes();
  await seedRecyclingCenters();
  await seedUsers();
  await seedReports();
  await seedNotifications();
  console.log("\n✅ All seed data loaded successfully!");
};
