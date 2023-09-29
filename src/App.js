import React, { useState, useEffect } from "react";
import { AiOutlinePlus } from "react-icons/ai"; //icons 사용
import Todo from "./Todo";
import { db } from "./firebase";
import {
  query,
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

// add style 즉 App.css가 필요없이. 여기에 한번에 꾸미기까지 할 수 있음.
const style = {
  bg: `h-screen w-screen p-4 bg-gradient-to-r from-[#F472B6] to-[#FCA5D3]`,
  /* h-screen: 화면의 높이를 전체 화면 크기로 설정합니다.
    w-screen: 화면의 너비를 전체 화면 크기로 설정합니다.
    p-4: 내부 패딩을 4개의 단위로 설정합니다. 여기서 '단위'는 Tailwind CSS의 크기 단위를 의미하며, 기본적으로 픽셀을 사용합니다.
    bg-gradient-to-r: 배경 색상을 오른쪽 방향으로 그라데이션(색상 변화)하도록 설정합니다.
    from-[#F472B6]: 그라데이션의 시작 색상을 #F472B6으로 설정합니다. 이는 연한 핑크색을 나타냅니다.
    to-[#FCA5D3]: 그라데이션의 끝 색상을 #FCA5D3으로 설정합니다. 이는 어두운 핑크색을 나타냅니다. 
    */
  container: `bg-gray-50 max-w-[500px] w-full m-auto rounded-md shadow-xl p-4`,
  /* bg-gray-50: Background Color
    max-w-[500px]: 최대 너비를 500px로 제한합니다. 이는 요소가 가로로 너무 넓어지는 것을 방지하기 위해 사용됩니다.
    w-full: 요소의 너비를 최대로 설정하여 부모 요소의 가로 너비를 모두 차지하도록 합니다.
    m-auto: 마진을 자동으로 설정하여 요소를 수평 중앙에 위치시킵니다.
    rounded-md: 요소의 모서리를 둥글게 만듭니다. "md"는 중간 정도의 둥근 정도를 의미합니다.
    shadow-xl: 요소에 그림자를 추가합니다. "xl"은 그림자의 크기와 세기를 나타냅니다.
    p-4: 안쪽 여백(padding)을 4개의 픽셀로 설정합니다. 이는 내용물과 요소의 경계 사이의 공간을 만듭니다. 
    */
  heading: `text-2xl font-bold text-center text-gray-800 p-2`,
  /*text-2xl: 텍스트의 크기를 "2xl"로 설정합니다. 
    font-bold: 텍스트에 굵은 글꼴을 적용합니다. 텍스트가 두껍고 진하게 표시됩니다.
    text-center: 텍스트를 가운데 정렬합니다. 가로 정렬을 수행하여 텍스트가 중앙에 위치하게 됩니다.
    text-gray-800: 텍스트의 색상을 "gray-800"으로 설정합니다. "gray-800"은 짙은 회색 계통의 색상을 의미합니다.
    p-2: 텍스트 주위에 안쪽 여백(padding)을 2개의 픽셀로 설정합니다. 이는 텍스트와 텍스트 주위 요소 사이의 간격을 만듭니다.
  
  */
  form: `flex justify-between`,
  /* flex: 요소를 Flex Container로 설정합니다. Flex Container는 내부의 Flex Items들을 정렬하는 컨테이너 역할을 합니다.
    justify-between: Flex Container 내부의 Flex Items들을 양쪽 끝으로 정렬합니다. 
    즉, 첫 번째 Flex Item은 컨테이너의 왼쪽 끝에, 마지막 Flex Item은 컨테이너의 오른쪽 끝에 배치되고, 
    나머지 Flex Items는 동일한 간격으로 균등하게 분산됩니다.
    이렇게 함으로써 Flex Container 내부의 Flex Items들이 컨테이너 양끝과 중간에 균등하게 배치되면서 좌우로 넓게 펼쳐지는 레이아웃을 만들 수 있습니다.
  */
  input: `border p-2 w-full text-xl`,
  /* border: 입력란(input) 주위에 테두리(border)를 만듭니다. 테두리의 스타일, 두께, 색상 등은 기본값에 따라 설정됩니다.
    p-2: 입력란 주위에 안쪽 여백(padding)을 2개의 픽셀로 설정합니다. 이는 입력란의 텍스트와 입력란 주위 요소 사이의 간격을 만듭니다.
    w-full: 입력란의 너비를 부모 요소의 가로 너비를 모두 차지하도록 설정합니다. 즉, 입력란이 가로로 꽉 차게 됩니다.
    text-xl: 입력란 안에 텍스트의 크기를 "xl"로 설정합니다. "xl"은 큰 크기의 텍스트를 의미합니다.  
  */
  button: `border p-4 ml-2 bg-purple-500 text-slate-100`,
  count: `text-center p-2`,
};

function App() {
  // Todo,jsx => this code for useState
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  // Create todo
  const createTodo = async (e) => {
    e.preventDefault(e);
    if (input === "") {
      alert("Please enter a valid todo");
      return;
    }
    await addDoc(collection(db, "todos"), {
      text: input,
      completed: false,
    });
    setInput("");
  };

  // Read todo from firebase
  useEffect(() => {
    const q = query(collection(db, "todos"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let todosArr = [];
      querySnapshot.forEach((doc) => {
        todosArr.push({ ...doc.data(), id: doc.id });
      });
      setTodos(todosArr);
    });
    return () => unsubscribe();
  }, []);

  // Update todo in firebase
  const toggleComplete = async (todo) => {
    await updateDoc(doc(db, "todos", todo.id), {
      completed: !todo.completed,
    });
  };

  // Delete todo
  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  };

  return (
    <div className={style.bg}>
      {" "}
      {/* 1. 스타일로 꾸미기. */}
      {/* 2. 겉에 꾸며주기 */}
      <div className={style.container}>
        {/* 3. heading 꾸며주기 */}
        <h3 className={style.heading}>Todo List</h3>
        {/* 4. form 만들기 시작. */}
        <form onSubmit={createTodo} className={style.form}>
          {/*5. form에 입력칸 만들기*/}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={style.input}
            type="text"
            placeholder="Add Todo"
          />
          {/* 6. form에 버튼 만들기.  npm install react-icons  -> '+' 싸인 만들기. */}
          <button className={style.button}>
            <AiOutlinePlus size={30} />
          </button>
        </form>
        {/* 7. Todo.jsx => use map through everything give it the name of to do */}
        <ul>
          {todos.map((todo, index) => (
            <Todo
              key={index}
              todo={todo} // passing state down in components
              toggleComplete={toggleComplete} //*이 함수는 todo 항목의 완료 상태를 변경하는 데 사용됩니다.
              deleteTodo={deleteTodo} // 항목의 상태를 변경하거나 삭제할 수 있도록 합니다.
            />
          ))}
        </ul>
        {/*write how many todo list in the website */}
        {todos.length < 1 ? null : (
          <p className={style.count}>{`You have ${todos.length} todos.`}</p>
        )}
      </div>
    </div>
  );
}

export default App;
