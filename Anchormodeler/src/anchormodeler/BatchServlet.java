package anchormodeler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskOptions;

@SuppressWarnings("serial")
public class BatchServlet extends HttpServlet {

    private static final Logger log = Logger.getLogger(BatchServlet.class.getName());

    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/plain");
        resp.getWriter().println("Anchormodeler batch");

        // Queue queue = QueueFactory.getDefaultQueue();
        // queue.add( TaskOptions.Builder.withPayload(new BatchDeferredTask()));
        // log.log(Level.INFO,"Added task to queue");

        update1();
    }

    public class BatchDeferredTask implements DeferredTask {

        @Override
        public void run() {
            log.log(Level.INFO, "My task started");
            log.log(Level.INFO, "My task finished");
        }

    }

    private static void update1() {
        log.log(Level.INFO, "Update1 started");
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        Query query = new Query("Model");
        List<Entity> items = datastore.prepare(query).asList(FetchOptions.Builder.withLimit(1000));
        log.log(Level.INFO, "Update1 fetched entities: " + items.size());
        int updatedCount = 0;
        for (Entity m : items) {
            boolean needUpdate = false;

            if (!m.hasProperty("loadCount")) {
                m.setProperty("loadCount", new Integer(0));
                m.setProperty("lastLoaded", new Date());
                needUpdate = true;
            }

            if (!m.hasProperty("keywordList")) {
                ArrayList<String> list = new ArrayList<String>();
                String keywords = (String) m.getProperty("keywords");
                if (keywords == null)
                    keywords = "";
                keywords = keywords.toLowerCase();
                String[] split = keywords.split(" ");
                for (String s : split) {
                    s = s.trim();
                    if (!list.contains(s))
                        list.add(s);
                }
                m.setProperty("keywordList", list);
                needUpdate = true;
            }

            if (needUpdate) {
                datastore.put(m);
                updatedCount++;
            }
        }
        log.log(Level.INFO, "Update1 finished, updated: " + updatedCount);
    }

}
