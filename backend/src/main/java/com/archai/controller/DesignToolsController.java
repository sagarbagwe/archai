package com.archai.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DesignToolsController {
    public record ContextRequest(@NotNull Map<String,Object> design,@NotBlank @Size(max=2_000) String question){}
    public record ModifyRequest(@NotNull Map<String,Object> design,@NotBlank @Size(max=1_000) String command){}
    public record FailureRequest(@NotNull Map<String,Object> design,@NotBlank String failedNodeId){}
    public record TrafficRequest(@NotNull Map<String,Object> design,@Min(1) @Max(100) int multiplier){}
    public record InterviewRequest(@NotBlank String systemName,@NotBlank String difficulty,String answer,Integer step){}
    public record ExportRequest(@NotNull Map<String,Object> design){}

    @PostMapping("/design/chat")
    public Map<String,Object> chat(@Valid @RequestBody ContextRequest request){
        List<String> components=listOfMaps(map(request.design().get("architecture")).get("nodes")).stream().map(n->String.valueOf(n.get("name"))).limit(8).toList();
        String answer="Reviewing " + String.join(", ",components) + ": " + contextualAnswer(request.question());
        return Map.of("answer",answer,"risks",List.of("Validate capacity assumptions with load tests","Confirm every stateful dependency has recovery targets"),"recommendations",List.of("Measure p95 and p99 latency per critical path","Document fallback behavior and ownership"));
    }

    @PostMapping("/design/modify")
    public Map<String,Object> modify(@Valid @RequestBody ModifyRequest request){
        return Map.of("summary","Proposed change: "+request.command(),"before",List.of("Current architecture remains unchanged"),"after",List.of("Add or replace only the requested components","Revalidate edge references and capacity assumptions"),"impact",List.of("Creates a new version before apply","May change latency, cost, consistency, and operational complexity"),"risk","Review data migration and rollback before applying.");
    }

    @PostMapping("/design/failure-simulation")
    public Map<String,Object> failure(@Valid @RequestBody FailureRequest request){
        Map<String,Object> architecture=map(request.design().get("architecture"));
        List<Map<String,Object>> nodes=listOfMaps(architecture.get("nodes"));
        List<Map<String,Object>> edges=listOfMaps(architecture.get("edges"));
        Map<String,List<String>> outgoing=new HashMap<>();
        for(Map<String,Object> edge:edges)outgoing.computeIfAbsent(String.valueOf(edge.get("source")),ignored->new ArrayList<>()).add(String.valueOf(edge.get("target")));
        Set<String> affected=new HashSet<>(); ArrayDeque<String> queue=new ArrayDeque<>(); queue.add(request.failedNodeId());
        while(!queue.isEmpty()){String id=queue.remove();if(!affected.add(id))continue;queue.addAll(outgoing.getOrDefault(id,List.of()));}
        List<String> names=nodes.stream().filter(n->affected.contains(String.valueOf(n.get("id")))).map(n->String.valueOf(n.get("name"))).toList();
        return Map.of("failedNodeId",request.failedNodeId(),"affectedComponents",names,"severity",names.size()>4?"critical":names.size()>1?"high":"medium","detection",List.of("Error-rate and latency alerts","Dependency health checks","Synthetic transaction failures"),"recovery",List.of("Fail over to healthy replicas","Open circuit breakers","Replay queued work after recovery"),"userExperience",names.size()>2?"Partial or full feature degradation":"Localized feature degradation");
    }

    @PostMapping("/design/traffic-simulation")
    public Map<String,Object> traffic(@Valid @RequestBody TrafficRequest request){
        double peak=number(map(request.design().get("estimation")).get("peakRps"));
        List<String> bottlenecks=listOfMaps(map(request.design().get("architecture")).get("nodes")).stream().filter(n->{String type=String.valueOf(n.get("type")).toLowerCase();return type.contains("database")||type.contains("queue")||type.contains("service");}).limit(6).map(n->String.valueOf(n.get("name"))).toList();
        return Map.of("multiplier",request.multiplier(),"currentPeakRps",peak,"requiredPeakRps",peak*request.multiplier(),"bottlenecks",bottlenecks,"recommendations",List.of("Scale stateless services horizontally","Verify database write and connection capacity","Increase cache coverage","Load-test queue lag"));
    }

    @PostMapping("/interview/start")
    public Map<String,Object> interviewStart(@Valid @RequestBody InterviewRequest request){return Map.of("step",1,"question","Before drawing the architecture for "+request.systemName()+", what functional and non-functional requirements would you clarify?","difficulty",request.difficulty());}

    @PostMapping("/interview/evaluate")
    public Map<String,Object> interviewEvaluate(@Valid @RequestBody InterviewRequest request){int words=request.answer()==null?0:request.answer().trim().split("\\s+").length;int score=Math.max(2,Math.min(10,words/10+4));return Map.of("score",score,"feedback",score>=8?"Strong coverage. Make assumptions explicit and quantify the hardest constraint.":"Cover scale, latency, availability, consistency, retention, and failure behavior.","nextQuestion","Estimate average and peak RPS, then identify the first likely bottleneck.","step",request.step()==null?2:request.step()+1);}

    @PostMapping(value="/export/markdown",produces="text/markdown")
    public String markdown(@Valid @RequestBody ExportRequest request){Map<String,Object> design=request.design();return "# "+value(design,"title","ArchAI design")+"\n\nGenerated system design.\n\n## Architecture\n\n```json\n"+String.valueOf(design.getOrDefault("architecture",Map.of()))+"\n```\n";}

    @PostMapping(value="/export/sql",produces=MediaType.TEXT_PLAIN_VALUE)
    public String sql(@Valid @RequestBody ExportRequest request){return "-- ArchAI generated schema starter\n-- Review indexes, constraints, and migration safety before production.\nCREATE TABLE IF NOT EXISTS architecture_component (\n  id VARCHAR(128) PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  component_type VARCHAR(80) NOT NULL,\n  technology VARCHAR(255),\n  configuration JSON\n);\n";}

    private String contextualAnswer(String question){String q=question.toLowerCase();if(q.contains("10x")||q.contains("traffic"))return "the stateless tier can scale horizontally, but database writes, queue consumers, and external quotas need explicit headroom.";if(q.contains("redis")||q.contains("cache"))return "a cache can reduce read latency and database load, but needs a clear invalidation policy and a database fallback.";if(q.contains("kafka")||q.contains("queue"))return "asynchronous messaging decouples producers from consumers, but introduces lag, duplicate delivery, ordering, and replay concerns.";return "trace the critical request path, quantify its limits, and verify failure and recovery behavior before changing the design.";}
    @SuppressWarnings("unchecked") private Map<String,Object> map(Object value){return value instanceof Map<?,?>?(Map<String,Object>)value:Map.of();}
    @SuppressWarnings("unchecked") private List<Map<String,Object>> listOfMaps(Object value){return value instanceof List<?>?(List<Map<String,Object>>)value:List.of();}
    private double number(Object value){return value instanceof Number n?n.doubleValue():0;}
    private String value(Map<String,Object> map,String key,String fallback){Object value=map.get(key);return value==null?fallback:String.valueOf(value);}
}
