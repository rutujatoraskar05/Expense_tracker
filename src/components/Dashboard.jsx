// Dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { Card, Row } from "antd";
import { Line, Pie } from "@ant-design/charts";
import moment from "moment";
import TransactionSearch from "./TransactionSearch";
import Header from "./Header";
import AddIncomeModal from "./Modals/AddIncome";
import AddExpenseModal from "./Modals/AddExpense";
import Cards from "./Cards";
import NoTransactions from "./NoTransactions";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, getDocs, query } from "firebase/firestore";
import Loader from "./Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { unparse } from "papaparse";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);

  const navigate = useNavigate();

  const processChartData = useMemo(() => {
    const balanceData = [];
    const spendingData = {};

    transactions.forEach((transaction) => {
      const monthYear = moment(transaction.date).format("MMM YYYY");
      const tag = transaction.tag;

      if (transaction.type === "income") {
        const data = balanceData.find((data) => data.month === monthYear);
        if (data) {
          data.balance += transaction.amount;
        } else {
          balanceData.push({ month: monthYear, balance: transaction.amount });
        }
      } else {
        const data = balanceData.find((data) => data.month === monthYear);
        if (data) {
          data.balance -= transaction.amount;
        } else {
          balanceData.push({ month: monthYear, balance: -transaction.amount });
        }

        spendingData[tag] = (spendingData[tag] || 0) + transaction.amount;
      }
    });

    const spendingDataArray = Object.keys(spendingData).map((key) => ({
      category: key,
      value: spendingData[key],
    }));

    return { balanceData, spendingDataArray };
  }, [transactions]);

  const { balanceData, spendingDataArray } = processChartData;

  const showExpenseModal = () => setIsExpenseModalVisible(true);
  const showIncomeModal = () => setIsIncomeModalVisible(true);
  const handleExpenseCancel = () => setIsExpenseModalVisible(false);
  const handleIncomeCancel = () => setIsIncomeModalVisible(false);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const onFinish = (values, type) => {
    const newTransaction = {
      type,
      date: moment(values.date).format("YYYY-MM-DD"),
      amount: parseFloat(values.amount),
      tag: values.tag,
      name: values.name,
    };

    setTransactions((prev) => [...prev, newTransaction]);
    setIsExpenseModalVisible(false);
    setIsIncomeModalVisible(false);
    addTransaction(newTransaction);
    calculateBalance();
  };

  const calculateBalance = () => {
    const incomeTotal = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const expensesTotal = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    setIncome(incomeTotal);
    setExpenses(expensesTotal);
    setCurrentBalance(incomeTotal - expensesTotal);
  };

  useEffect(() => {
    calculateBalance();
  }, [transactions]);

  const addTransaction = async (transaction, many) => {
    try {
      const docRef = await addDoc(
        collection(db, `users/${user.uid}/transactions`),
        transaction
      );
      console.log("Document written with ID: ", docRef.id);
      if (!many) toast.success("Transaction Added!");
    } catch (e) {
      console.error("Error adding document: ", e);
      if (!many) toast.error("Couldn't add transaction");
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    if (user) {
      try {
        const q = query(collection(db, `users/${user.uid}/transactions`));
        const querySnapshot = await getDocs(q);
        const transactionsArray = querySnapshot.docs.map((doc) => doc.data());
        setTransactions(transactionsArray);
        toast.success("Transactions Fetched!");
      } catch (error) {
        toast.error("Error fetching transactions");
        console.error("Error fetching transactions: ", error);
      }
    }
    setLoading(false);
  };

  const balanceConfig = {
    data: balanceData,
    xField: "month",
    yField: "balance",
  };

  const spendingConfig = {
    data: spendingDataArray,
    angleField: "value",
    colorField: "category",
  };

  const reset = () => console.log("resetting");

  const cardStyle = {
    boxShadow: "0px 0px 30px 8px rgba(227, 227, 227, 0.75)",
    margin: "2rem",
    borderRadius: "0.5rem",
    minWidth: "400px",
    flex: 1,
  };

  const exportToCsv = () => {
    const csv = unparse(transactions, {
      fields: ["name", "type", "date", "amount", "tag"],
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-container">
      <Header />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Cards
            currentBalance={currentBalance}
            income={income}
            expenses={expenses}
            showExpenseModal={showExpenseModal}
            showIncomeModal={showIncomeModal}
            cardStyle={cardStyle}
            reset={reset}
          />

          <AddExpenseModal
            isExpenseModalVisible={isExpenseModalVisible}
            handleExpenseCancel={handleExpenseCancel}
            onFinish={onFinish}
          />
          <AddIncomeModal
            isIncomeModalVisible={isIncomeModalVisible}
            handleIncomeCancel={handleIncomeCancel}
            onFinish={onFinish}
          />
          {transactions.length === 0 ? (
            <NoTransactions />
          ) : (
            <Row gutter={16}>
              <Card bordered={true} style={cardStyle}>
                <h2>Financial Statistics</h2>
                <Line {...balanceConfig} />
              </Card>

              <Card bordered={true} style={{ ...cardStyle, flex: 0.45 }}>
                <h2>Total Spending</h2>
                {spendingDataArray.length === 0 ? (
                  <p>Seems like you haven't spent anything till now...</p>
                ) : (
                  <Pie {...spendingConfig} />
                )}
              </Card>
            </Row>
          )}
          <TransactionSearch
            transactions={transactions}
            exportToCsv={exportToCsv}
            fetchTransactions={fetchTransactions}
            addTransaction={addTransaction}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
