import React, { useRef, useState } from "react";
import { Input, Table, Select, Radio } from "antd";
import { parse } from "papaparse";
import { toast } from "react-toastify";
import search from "../assets/search.svg";

const { Search } = Input;
const { Option } = Select;

const TransactionSearch = ({ transactions, exportToCsv, addTransaction, fetchTransactions }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState("");
  const fileInput = useRef();

  const importFromCsv = async (event) => {
    event.preventDefault();
    try {
      const results = await parse(event.target.files[0], { header: true });
      const transactionsToAdd = results.data.map(transaction => ({
        ...transaction,
        amount: parseInt(transaction.amount, 10),
      }));

      await Promise.all(transactionsToAdd.map(addTransaction));
      toast.success("All Transactions Added");
      fetchTransactions();
      event.target.value = null; // Clear input after import
    } catch (error) {
      toast.error("Failed to import transactions: " + error.message);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Tag",
      dataIndex: "tag",
      key: "tag",
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const searchMatch = searchTerm
      ? transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const tagMatch = selectedTag ? transaction.tag === selectedTag : true;
    const typeMatch = typeFilter ? transaction.type === typeFilter : true;

    return searchMatch && tagMatch && typeMatch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortKey === "amount") {
      return a.amount - b.amount;
    } else {
      return 0;
    }
  });

  const dataSource = sortedTransactions.map((transaction, index) => ({
    key: index,
    ...transaction,
  }));

  return (
    <div style={{ width: "100%", padding: "0rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
        <div className="input-flex">
          <img src={search} width="16" alt="Search" />
          <input
            placeholder="Search by Name"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          className="select-input"
          onChange={(value) => setTypeFilter(value)}
          value={typeFilter}
          placeholder="Filter"
          allowClear
        >
          <Option value="">All</Option>
          <Option value="income">Income</Option>
          <Option value="expense">Expense</Option>
        </Select>
      </div>
      
      <div className="my-table">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "1rem" }}>
          <h2>My Transactions</h2>
          <Radio.Group
            className="input-radio"
            onChange={(e) => setSortKey(e.target.value)}
            value={sortKey}
          >
            <Radio.Button value="">No Sort</Radio.Button>
            <Radio.Button value="date">Sort by Date</Radio.Button>
            <Radio.Button value="amount">Sort by Amount</Radio.Button>
          </Radio.Group>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", width: "400px" }}>
            <button className="btn" onClick={exportToCsv}>Export to CSV</button>
            <label htmlFor="file-csv" className="btn btn-blue">Import from CSV</label>
            <input
              onChange={importFromCsv}
              id="file-csv"
              type="file"
              accept=".csv"
              required
              style={{ display: "none" }}
            />
          </div>
        </div>

        <Table columns={columns} dataSource={dataSource} />
      </div>
    </div>
  );
};

export default TransactionSearch;
