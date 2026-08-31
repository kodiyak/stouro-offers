import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { APP_CONFIG } from "@/app.config";
import Logo from "@/assets/logo_pdf.png";
import type { Api } from "@/lib/clients/api/types";
import { useCurrencyFormatter, useDateFormatter, useLabels } from "@/lib/hooks";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingBottom: 40,
  },
  logo: {
    width: 200,
    height: 100,
    objectFit: "contain",
  },
  wFull: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col: {
    flexDirection: "column",
  },
  textXl: {
    fontSize: 24,
    fontWeight: "bold",
  },
  textLg: {
    fontSize: 16,
  },
  textMd: {
    fontSize: 14,
  },
  textSm: {
    fontSize: 12,
  },
  textXs: {
    fontSize: 10,
  },
  textMuted: {
    color: "#888888",
  },
  textBold: {
    fontWeight: "bold",
  },
  textRight: {
    textAlign: "right",
  },
  w40: {
    width: 40,
  },
  w90: {
    width: 90,
  },
  borderB: {
    borderBottom: 1,
  },
  borderT: {
    borderTop: 1,
  },
  bordered: {
    borderColor: "#ccc",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: 1,
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

interface OrderDocumentProps {
  order: Api.Order;
}

export default function OrderDocument({ order }: OrderDocumentProps) {
  const { formatCurrency } = useCurrencyFormatter();
  const { formatDate } = useDateFormatter();
  const labels = useLabels();

  const items = order.items.filter((item) => item.quantity > 0);
  const amountTotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <Image source={Logo.src} style={styles.logo} />
          <View
            style={[
              styles.col,
              { alignItems: "flex-end", padding: 10, flex: 1 },
            ]}
          >
            <Text style={styles.textXs}>{APP_CONFIG.company.name}</Text>
            <Text style={styles.textXs}>{APP_CONFIG.company.email}</Text>
            <Text style={styles.textXs}>{APP_CONFIG.company.phone}</Text>
            <Text style={[styles.textXs, { marginTop: 10 }]}>
              Emitido em: {formatDate(new Date())}
            </Text>
          </View>
        </View>
        <View
          style={{
            ...styles.col,
            borderTop: 1,
            borderBottom: 1,
            borderColor: "#ccc",
            paddingVertical: 5,
            paddingHorizontal: 10,
          }}
        >
          <View style={[styles.row, { alignItems: "center" }]}>
            <Text style={[styles.textXl, styles.textBold]}>
              Pedido {`#${order.orderNumber}`}
            </Text>
            <Text style={[styles.textMd, styles.textBold]}>
              {labels.ORDER_STATUS[order.status].toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.textSm, styles.textMuted]}>
            {order.customer.name}
          </Text>
          <Text style={[styles.textXs, styles.textMuted]}>
            Criado em: {formatDate(order.createdAt)}
          </Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.textXs, styles.textBold, { flex: 1 }]}>
            Item
          </Text>
          <Text
            style={[
              styles.textXs,
              styles.textBold,
              styles.textRight,
              styles.w40,
            ]}
          >
            Qtd
          </Text>
          <Text
            style={[
              styles.textXs,
              styles.textBold,
              styles.textRight,
              styles.w90,
            ]}
          >
            Unitário
          </Text>
          <Text
            style={[
              styles.textXs,
              styles.textBold,
              styles.textRight,
              styles.w90,
            ]}
          >
            Subtotal
          </Text>
        </View>
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.row,
              styles.borderB,
              styles.bordered,
              { paddingHorizontal: 10, paddingVertical: 5 },
            ]}
          >
            <Text style={[styles.textSm, styles.textBold, { flex: 1 }]}>
              {item.name}
            </Text>
            <Text style={[styles.textSm, styles.textRight, styles.w40]}>
              {item.quantity}
            </Text>
            <Text style={[styles.textSm, styles.textRight, styles.w90]}>
              {formatCurrency(item.price)}
            </Text>
            <Text
              style={[
                styles.textSm,
                styles.textBold,
                styles.textRight,
                styles.w90,
              ]}
            >
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </View>
        ))}
        <View style={styles.row}>
          <View style={{ flex: 1 }} />
          <View style={{ ...styles.col, padding: 10, alignItems: "flex-end" }}>
            <Text style={[styles.textMd, styles.textMuted, styles.textBold]}>
              Total
            </Text>
            <Text style={styles.textXl}>{formatCurrency(amountTotal)}</Text>
          </View>
        </View>
        <View fixed style={styles.footer}>
          <Text style={styles.textXs}>
            Gerado por {APP_CONFIG.company.name}
          </Text>
          <Text
            style={styles.textXs}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
