import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc, deleteDoc, doc } from './firebase';
import { jsPDF } from 'jspdf';
import './App.css';

function App() {
  const [nome, setNome] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [mes, setMes] = useState('');
  const [pagamentos, setPagamentos] = useState([]);

  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    const querySnapshot = await getDocs(collection(db, 'alunos'));
    const alunosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAlunos(alunosData);
  };

  const salvarNome = async () => {
    if (nome.trim() !== '') {
      const docRef = await addDoc(collection(db, 'alunos'), { nome });
      setAlunos([...alunos, { id: docRef.id, nome }]);
      setNome('');
    }
  };

  const selecionarAluno = async (aluno) => {
    setAlunoSelecionado(aluno);
    const querySnapshot = await getDocs(collection(db, 'alunos', aluno.id, 'pagamentos'));
    const pagamentosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPagamentos(pagamentosData);
  };

  const adicionarMes = async () => {
    if (mes.trim() !== '' && alunoSelecionado) {
      const docRef = await addDoc(collection(db, 'alunos', alunoSelecionado.id, 'pagamentos'), { mes });
      setPagamentos([...pagamentos, { id: docRef.id, mes }]);
      setMes('');
    }
  };

  const excluirAluno = async (id) => {
    const alunoDoc = doc(db, 'alunos', id);
    await deleteDoc(alunoDoc);
    setAlunos(alunos.filter((aluno) => aluno.id !== id));
    if (alunoSelecionado?.id === id) {
      setAlunoSelecionado(null);
      setPagamentos([]);
    }
  };

  const excluirMes = async (id) => {
    const pagamentoDoc = doc(db, 'alunos', alunoSelecionado.id, 'pagamentos', id);
    await deleteDoc(pagamentoDoc);
    setPagamentos(pagamentos.filter((pagamento) => pagamento.id !== id));
  };

  const gerarPDF = () => {
    if (!alunoSelecionado) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Relatório de Pagamentos`, 10, 10);
    doc.setFontSize(12);
    doc.text(`Aluno: ${alunoSelecionado.nome}`, 10, 20);

    if (pagamentos.length > 0) {
      doc.text('Meses Pagos:', 10, 30);
      pagamentos.forEach((p, index) => {
        doc.text(`${index + 1}. ${p.mes}`, 10, 40 + index * 10);
      });
    } else {
      doc.text('Nenhum mês pago registrado.', 10, 30);
    }

    doc.save(`Relatorio_${alunoSelecionado.nome}.pdf`);
  };

  return (
    <div className="container">
      <div className="formulario">
        <h1>Gestão de Pagamentos</h1>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite o nome do aluno"
        />
        <button onClick={salvarNome}>Salvar Nome</button>
      </div>

      <div className="lista-alunos">
        <h2>Alunos Salvos</h2>
        <ul>
          {alunos.length === 0 ? (
            <li className="nenhum-aluno">Nenhum aluno registrado.</li>
          ) : (
            alunos.map((aluno) => (
              <li key={aluno.id} className="aluno-item">
                <span onClick={() => selecionarAluno(aluno)}>{aluno.nome}</span>
                <button
                  className="excluir-btn"
                  onClick={() => excluirAluno(aluno.id)}
                >
                  Excluir
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {alunoSelecionado && (
        <div className="pagamentos">
          <h3>Gerenciar Pagamentos de {alunoSelecionado.nome}</h3>
          <input
            type="text"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            placeholder="Digite o mês (ex: Janeiro)"
          />
          <button onClick={adicionarMes}>Adicionar Mês</button>
          <h4>Meses Pagos:</h4>
          <ul>
            {pagamentos.length === 0 ? (
              <li className="nenhum-mes">Nenhum mês pago.</li>
            ) : (
              pagamentos.map((p) => (
                <li key={p.id}>
                  {p.mes}
                  <button
                    className="excluir-btn"
                    onClick={() => excluirMes(p.id)}
                  >
                    Excluir
                  </button>
                </li>
              ))
            )}
          </ul>
          <button className="gerar-pdf-btn" onClick={gerarPDF}>
            Gerar PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
