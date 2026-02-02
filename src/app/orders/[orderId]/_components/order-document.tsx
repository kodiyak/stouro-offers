import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import Logo from "@/assets/logo.png";
import type { Api } from "@/lib/clients/api/types";
import { useCurrencyFormatter } from "@/lib/hooks";
import { getOrderPosition } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  card: {
    padding: 30,
  },
  logo: {
    width: 200,
    height: 200,
    margin: "20px auto",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#666666",
    fontWeight: "bold",
    marginBottom: 30,
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
  textSm: {
    fontSize: 12,
    color: "#888888",
    fontWeight: "bold",
  },
});

interface OrderDocumentProps {
  order: Api.Order;
}

export default function OrderDocument({ order }: OrderDocumentProps) {
  const { formatCurrency } = useCurrencyFormatter();

  const amountTotal = order.items.reduce(
    (acc, item) => acc + item.amountTotal,
    0,
  );

  return (
    <Document key={Date.now().toString()}>
      <Page size="A4" style={styles.page}>
        <View>
          <Image source={Logo.src} style={styles.logo} />
        </View>
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.title}>
              Pedido {getOrderPosition(order.position)}
            </Text>
            <Text style={styles.subtitle}>{order.customer.name}</Text>
            {order.items
              .filter((i) => i.quantity > 0)
              .map((item) => (
                <View key={item.id} style={{ ...styles.row, marginBottom: 10 }}>
                  <View style={styles.col}>
                    <Text style={styles.textLg}>
                      {item.quantity} x {item.name}
                    </Text>
                    <Text style={styles.textSm}>
                      {formatCurrency(item.price)} / unidade
                    </Text>
                  </View>
                  <Text style={{ fontWeight: "bold" }}>
                    {formatCurrency(item.amountTotal)}
                  </Text>
                </View>
              ))}
            <View style={{ ...styles.row, marginTop: 20 }}>
              <View />
              <View style={{ ...styles.col, alignItems: "flex-end" }}>
                <Text style={{ ...styles.textLg, fontWeight: "bold" }}>
                  Total
                </Text>
                <Text style={styles.textXl}>{formatCurrency(amountTotal)}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
