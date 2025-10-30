import { useEffect, useState, type ReactElement } from 'react';
import { Container, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getClasses, getLessons, type Lesson, type Class } from '../../../shared/';
import TableBody from '../components/TableBody';
import '../styles/Timetable.css'

const Timetable = (): ReactElement => {

    const { t } = useTranslation('timetable');
    const [ classes, setClasses ] = useState<Class[]>();
    const [ lessons, setLessons ] = useState<Lesson[]>();
    const [ selectedClass, setSelectedClass ] = useState<Class | null>(null);

    useEffect(() => {
        async function fetchClasses(){
            const fetchedClasses: any | null = await getClasses();
            if(fetchedClasses.data == null) return;

            const tmp: Class[] = fetchedClasses.data.map((_class: Class) => {
                return {
                    grade: _class.grade,
                    class: _class.class
                }
            });
            setClasses(tmp);

        }

        async function fetchLessons() {
            const fetchedLessons: any = await getLessons();
            if(fetchedLessons)  setLessons(fetchedLessons); 
            else setLessons([]);
            
        }

        fetchClasses();
        fetchLessons();
    }, []);
    
    return(
        <Container>
            <h2>{t('title')}</h2>
            <Form>
                <Form.Group className='form-groups'>
                    <Form.Label className='mt-1'>{t('classes')}</Form.Label>
                    <Form.Select 
                        className='class-selection ms-2'
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value && classes) {
                                const [grade, className] = value.split('-');
                                const selected = classes.find(c => c.grade === grade && c.class === className);
                                setSelectedClass(selected || null);
                            } else {
                                setSelectedClass(null);
                            }
                        }}
                    >
                        <option value="">{t('select_class')}</option>
                        {classes?.map((_class: Class, idx: number) => {
                            return(
                                <option key={idx} value={`${_class.grade}-${_class.class}`}>
                                    {_class.grade}-{_class.class}
                                </option>
                            );
                        })}
                    </Form.Select>
                </Form.Group>
            </Form>
            <TableBody 
                lessons={lessons || []} 
                selectedClass={selectedClass} 
            />
        </Container>
    )
}

export default Timetable;