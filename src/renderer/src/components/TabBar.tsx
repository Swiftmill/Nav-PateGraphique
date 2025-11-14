import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { SessionTab } from '@common/types';

interface Props {
  tabs: SessionTab[];
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onCreate: () => void;
  onDetach: (id: string) => void;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  onSplit: (leftId: string, rightId: string) => void;
  onUnsplit: () => void;
}

const TabBar = ({ tabs, onActivate, onClose, onCreate, onDetach, onReorder, onSplit, onUnsplit }: Props) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onReorder(result.source.index, result.destination.index);
  };

  const handleSplit = () => {
    if (tabs.length < 2) return;
    const active = tabs.find((tab) => tab.isActive) ?? tabs[0];
    const secondary = tabs.find((tab) => tab.id !== active.id);
    if (!secondary) return;
    onSplit(active.id, secondary.id);
  };

  return (
    <div className="tab-bar" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tab-bar" direction="horizontal">
          {(provided) => (
            <div
              className="tab-list"
              style={{ display: 'flex', gap: '8px', flex: 1 }}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {tabs.map((tab, index) => (
                <Draggable key={tab.id} draggableId={tab.id} index={index}>
                  {(dragProvided) => (
                    <div
                      className={`tab ${tab.isActive ? 'active tab-active' : ''}`}
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      onClick={() => onActivate(tab.id)}
                      onDoubleClick={() => onDetach(tab.id)}
                    >
                      <span style={{ fontWeight: 500 }}>{tab.title || tab.url}</span>
                      <button onClick={(event) => { event.stopPropagation(); onClose(tab.id); }}>✕</button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button onClick={onCreate}>+</button>
      <button onClick={handleSplit}>⧉</button>
      <button onClick={onUnsplit}>⇱</button>
    </div>
  );
};

export default TabBar;
