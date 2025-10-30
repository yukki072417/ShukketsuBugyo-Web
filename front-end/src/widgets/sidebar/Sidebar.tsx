import { useEffect, useState, useCallback, type ReactElement } from "react";
import { Container, Nav } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import "./SideBar.css";
import { whoami } from "../../shared/api/common";
import { type Teacher } from "../../shared/utils/type";

const Sidebar = (): ReactElement => {
  const { t, i18n } = useTranslation("sidebar");

  const [sidebarState, setSidebarState] = useState<"closed" | "opening" | "opened" | "closing">("closed");
  const [teacherInfo, setTeacherInfo] = useState<Teacher | null>(null);
  const [languageMode, setLanguageMode] = useState<"ja" | "en">("ja");
  const [loading, setLoading] = useState<boolean>(true);

  const spinner = <Spinner className="spinner" animation="border" />
  const closedIcon: ReactElement = (
    <svg className="open-btn-icon" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFFFFF">
      <path d="m309.67-81.33-61-61.67L587-481.33 248.67-819.67l61-61.66 400 400-400 400Z" />
    </svg>
  );

  const openedIcon: ReactElement = (
    <svg className="open-btn-icon" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFFFFF">
      <path d="M400-80 0-480l400-400 61 61.67L122.67-480 461-141.67 400-80Z" />
    </svg>
  );

  // アニメーション終了処理
  useEffect(() => {
    const sidebarElement = document.querySelector(".tub");

    const handleAnimationEnd = () => {
      setSidebarState(prev => {
        if (prev === "opening") return "opened";
        if (prev === "closing") return "closed";
        return prev;
      });
    };

    sidebarElement?.addEventListener("animationend", handleAnimationEnd);
    return () => {
      sidebarElement?.removeEventListener("animationend", handleAnimationEnd);
    };
  }, []);

  // 初期化（言語設定とデータ取得）
  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "ja";
    const initialLang = savedLang === "en" ? "en" : "ja";
    
    i18n.changeLanguage(savedLang);
    setLanguageMode(initialLang);

    // StorageEventリスナーを追加（他のタブやコンポーネントからの変更を検知）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language' && e.newValue) {
        const newLang = e.newValue === "en" ? "en" : "ja";
        setLoading(true);
        i18n.changeLanguage(e.newValue);
        setLanguageMode(newLang);
      }
    };

    // CustomEventリスナーを追加（同一タブ内での変更を検知）
    const handleLanguageChange = (e: CustomEvent) => {
      const newLang = e.detail === "en" ? "en" : "ja";
      setLoading(true);
      i18n.changeLanguage(e.detail);
      setLanguageMode(newLang);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);



  // API取得用の共通関数
  const fetchTeacherInfo = useCallback(async () => {
    setLoading(true);
    try {
      const informations = await whoami();
      setTeacherInfo(informations.data);
    } catch (error) {
      console.error('Failed to fetch teacher information:', error);
      setTeacherInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回ロード時とlanguageMode変更時にAPI取得
  useEffect(() => {
    fetchTeacherInfo();
  }, [languageMode, fetchTeacherInfo]);

  const toggleSidebar = () => {
    setSidebarState(prev =>
      prev === "closed" ? "opening" : prev === "opened" ? "closing" : prev
    );
  };

  return (
    <aside className={`sidebar ${sidebarState === "opened" ? "opened" : ""}`}>
      <main>
        {["opening", "opened"].includes(sidebarState) && (
          <div className="overlay" onClick={() => setSidebarState("closing")} />
        )}

        <Nav className={`tub ${sidebarState}`} style={{ pointerEvents: sidebarState === "closed" ? "none" : "auto" }}>
          <Container className="user-informations">
            <p>ID: {loading ? spinner : (teacherInfo?.teacher_id || "N/A")}</p> 
          </Container>

          <ul>
            <li><Nav.Link href="/teacher/main" className="tub-items">{t("dashboard_label")}</Nav.Link></li>
            <li><Nav.Link href="/teacher/main/school-settings" className="tub-items">{t("school_settings")}</Nav.Link></li>
            <li><Nav.Link href="/teacher/main/lessons" className="tub-items">{t("lessons_label")}</Nav.Link></li>
            <li><Nav.Link href="/teacher/main/timetable" className="tub-items">{t("timetable_label")}</Nav.Link></li>
            <li><Nav.Link href="/teacher/main/attendance" className="tub-items">{t("attendance_label")}</Nav.Link></li>
            <li><Nav.Link href="/teacher/main/logout" className="tub-items logout-btn">{t("logout")}</Nav.Link></li>
          </ul>
        </Nav>

        <span id="open-btn" className={sidebarState} onClick={toggleSidebar}>
          {["opened", "opening"].includes(sidebarState) ? openedIcon : closedIcon}
        </span>

        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </aside>
  );
};

export default Sidebar;