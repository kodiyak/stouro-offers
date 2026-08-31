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
import { useCurrencyFormatter } from "@/lib/hooks";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 200,
    height: 100,
    objectFit: "contain",
  },
  card: {
    padding: 30,
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
  textXxs: {
    fontSize: 10,
  },
  textMuted: {
    color: "#888888",
  },
  textBold: {
    fontWeight: "bold",
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
});

interface OrderDocumentProps {
  order: Api.Order;
}

export default function OrderDocument({ order }: OrderDocumentProps) {
  const { formatCurrency } = useCurrencyFormatter();

  const amountTotal = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <Document key={Date.now().toString()}>
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <Image source={Logo.src} style={styles.logo} />
          <View
            style={[
              styles.col,
              { alignItems: "flex-end", padding: 10, flex: 1 },
            ]}
          >
            <Text style={styles.textXxs}>{APP_CONFIG.company.name}</Text>
            <Text style={styles.textXxs}>{APP_CONFIG.company.email}</Text>
            <Text style={styles.textXxs}>{APP_CONFIG.company.phone}</Text>
            <Text style={[styles.textXxs, { marginTop: 10 }]}>
              Data de Emissão: {new Date().toLocaleString()}
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
          <Text style={[styles.textXl, styles.textBold]}>
            Pedido {`#${order.orderNumber}`}
          </Text>
          <Text style={[styles.textSm, styles.textMuted]}>
            {order.customer.name}
          </Text>
        </View>
        <View style={styles.wFull}>
          {order.items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.row,
                styles.borderB,
                styles.bordered,
                { paddingHorizontal: 10, paddingVertical: 5 },
              ]}
            >
              <View style={[styles.col, { flex: 1 }]}>
                <Text style={[styles.textSm, styles.textBold]}>
                  {item.quantity} x {item.name}
                </Text>
                <Text style={[styles.textXxs, styles.textMuted]}>
                  {formatCurrency(item.price)} / unidade
                </Text>
              </View>
              <Text style={[styles.textSm, styles.textBold]}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }} />
          <View style={{ ...styles.col, padding: 10, alignItems: "flex-end" }}>
            <Text style={[styles.textMd, styles.textMuted, styles.textBold]}>
              Total
            </Text>
            <Text style={[styles.textXl]}>{formatCurrency(amountTotal)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
